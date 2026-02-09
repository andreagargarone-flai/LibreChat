import React, { useState, useCallback, useMemo, useEffect } from 'react';
import * as Ariakit from '@ariakit/react';
import { TFeedback, TFeedbackTag, getTagsForRating } from 'librechat-data-provider';
import {
  ThumbUpIcon,
  ThumbDownIcon,
} from '@librechat/client';
import {
  AlertCircle,
  PenTool,
  ImageOff,
  Ban,
  HelpCircle,
  CheckCircle,
  Lightbulb,
  Search,
} from 'lucide-react';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

interface FeedbackProps {
  handleFeedback: ({
    feedback,
    feedbackText,
  }: {
    feedback?: TFeedback | null;
    feedbackText?: string | null;
  }) => void;
  feedback?: TFeedback;
  isLast?: boolean;
}

const ICONS = {
  AlertCircle,
  PenTool,
  ImageOff,
  Ban,
  HelpCircle,
  CheckCircle,
  Lightbulb,
  Search,
  ThumbsUp: ThumbUpIcon,
  ThumbsDown: ThumbDownIcon,
};

function FeedbackOptionButton({
  tag,
  active,
  onClick,
}: {
  tag: TFeedbackTag;
  active?: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const localize = useLocalize();
  const Icon = ICONS[tag.icon as keyof typeof ICONS] || AlertCircle;
  const label = localize(tag.label as Parameters<typeof localize>[0]);

  return (
    <button
      className={cn(
        'flex w-full items-center gap-3 rounded-xl p-2 text-text-secondary transition-colors duration-200 hover:bg-surface-hover hover:text-text-primary',
        active && 'bg-surface-hover font-semibold text-text-primary',
      )}
      onClick={onClick}
      type="button"
      aria-label={label}
      aria-pressed={active}
    >
      <Icon size="19" bold={active ? true : undefined} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

function FeedbackButtons({
  isLast,
  feedback,
  onFeedback,
}: {
  isLast: boolean;
  feedback?: TFeedback;
  onFeedback: (fb: TFeedback | undefined | null) => void;
}) {
  const localize = useLocalize();
  const upStore = Ariakit.usePopoverStore({ placement: 'bottom' });
  const downStore = Ariakit.usePopoverStore({ placement: 'bottom' });

  const positiveTags = useMemo(() => getTagsForRating('thumbsUp'), []);
  const negativeTags = useMemo(() => getTagsForRating('thumbsDown'), []);

  const upActive = feedback?.rating === 'thumbsUp' ? feedback.tag?.key : undefined;
  const downActive = feedback?.rating === 'thumbsDown' ? feedback.tag?.key : undefined;

  const handleThumbsUpClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (feedback?.rating !== 'thumbsUp') {
        upStore.toggle();
        return;
      }
      onFeedback(null);
    },
    [feedback?.rating, onFeedback, upStore],
  );

  const handleUpOption = useCallback(
    (tag: TFeedbackTag) => (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      upStore.hide();
      // Decoupled: only send rating and tag
      onFeedback({
        rating: 'thumbsUp',
        tag,
      });
    },
    [onFeedback, upStore],
  );

  const handleThumbsDownClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (feedback?.rating !== 'thumbsDown') {
        downStore.toggle();
        return;
      }
      onFeedback(null);
    },
    [feedback?.rating, onFeedback, downStore],
  );

  const handleDownOption = useCallback(
    (tag: TFeedbackTag) => (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      downStore.hide();
      // Decoupled: only send rating and tag
      onFeedback({
        rating: 'thumbsDown',
        tag,
      });
    },
    [onFeedback, downStore],
  );

  return (
    <>
      <Ariakit.PopoverAnchor
        store={upStore}
        render={
          <button
            className={buttonClasses(feedback?.rating === 'thumbsUp', isLast)}
            onClick={handleThumbsUpClick}
            type="button"
            title={localize('com_ui_feedback_positive')}
            aria-pressed={feedback?.rating === 'thumbsUp'}
            aria-haspopup="menu"
          >
            <ThumbUpIcon size="19" bold={feedback?.rating === 'thumbsUp' ? true : undefined} />
          </button>
        }
      />
      <Ariakit.Popover
        store={upStore}
        gutter={8}
        portal
        unmountOnHide
        className="popover-animate flex w-auto flex-col gap-1.5 overflow-hidden rounded-2xl border border-border-medium bg-surface-secondary p-1.5 shadow-lg"
      >
        <div className="flex flex-col items-stretch justify-center">
          {positiveTags.map((tag) => (
            <FeedbackOptionButton
              key={tag.key}
              tag={tag}
              active={upActive === tag.key}
              onClick={handleUpOption(tag)}
            />
          ))}
        </div>
      </Ariakit.Popover>

      <Ariakit.PopoverAnchor
        store={downStore}
        render={
          <button
            className={buttonClasses(feedback?.rating === 'thumbsDown', isLast)}
            onClick={handleThumbsDownClick}
            type="button"
            title={localize('com_ui_feedback_negative')}
            aria-pressed={feedback?.rating === 'thumbsDown'}
            aria-haspopup="menu"
          >
            <ThumbDownIcon size="19" bold={feedback?.rating === 'thumbsDown' ? true : undefined} />
          </button>
        }
      />
      <Ariakit.Popover
        store={downStore}
        gutter={8}
        portal
        unmountOnHide
        className="popover-animate flex w-auto flex-col gap-1.5 overflow-hidden rounded-2xl border border-border-medium bg-surface-secondary p-1.5 shadow-lg"
      >
        <div className="flex flex-col items-stretch justify-center">
          {negativeTags.map((tag) => (
            <FeedbackOptionButton
              key={tag.key}
              tag={tag}
              active={downActive === tag.key}
              onClick={handleDownOption(tag)}
            />
          ))}
        </div>
      </Ariakit.Popover>
    </>
  );
}

function buttonClasses(isActive: boolean, isLast: boolean) {
  return cn(
    'hover-button rounded-lg p-1.5 text-text-secondary-alt transition-all duration-200',
    'hover:text-text-primary hover:bg-surface-tertiary',
    'md:group-hover:visible md:group-focus-within:visible md:group-[.final-completion]:visible',
    !isLast && 'md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100',
    'focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:outline-none text-sm',
    isActive && 'visible opacity-100 text-text-primary bg-surface-tertiary font-bold active shadow-sm',
  );
}

export default function Feedback({
  isLast = false,
  handleFeedback,
  feedback: initialFeedback,
}: FeedbackProps) {
  const localize = useLocalize();
  const [feedback, setFeedback] = useState<TFeedback | undefined>(initialFeedback);

  useEffect(() => {
    setFeedback(initialFeedback);
  }, [initialFeedback]);

  const propagateMinimal = useCallback(
    (fb: TFeedback | undefined | null) => {
      setFeedback(fb || undefined);
      handleFeedback({ feedback: fb });
    },
    [handleFeedback],
  );

  const handleButtonFeedback = useCallback(
    (fb: TFeedback | undefined | null) => {
      propagateMinimal(fb);
    },
    [propagateMinimal],
  );

  const renderSingleFeedbackButton = () => {
    if (!feedback) {
      return null;
    }
    const isThumbsUp = feedback.rating === 'thumbsUp';
    const Icon = isThumbsUp ? ThumbUpIcon : ThumbDownIcon;
    const label = isThumbsUp
      ? localize('com_ui_feedback_positive')
      : localize('com_ui_feedback_negative');
    return (
      <button
        className={buttonClasses(true, isLast)}
        onClick={() => {
          handleButtonFeedback(null as any);
        }}
        type="button"
        title={label}
        aria-pressed="true"
      >
        <Icon size="19" bold />
      </button>
    );
  };

  return (
    <>
      {feedback?.rating ? (
        renderSingleFeedbackButton()
      ) : (
        <FeedbackButtons
          isLast={isLast}
          feedback={feedback}
          onFeedback={handleButtonFeedback}
        />
      )}
    </>
  );
}
