import React, { useState } from 'react';
import { OGDialog, OGDialogTemplate, Button, Label, useToastContext } from '@librechat/client';
import type { TFeedback } from 'librechat-data-provider';
import { useLocalize } from '~/hooks';

interface TextFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageId: string;
  conversationId: string;
  existingFeedback?: TFeedback;
  handleFeedback: ({ feedback }: { feedback: TFeedback | undefined }) => void;
}

export default function TextFeedbackDialog({
  open,
  onOpenChange,
  existingFeedback,
  handleFeedback,
}: TextFeedbackDialogProps) {
  const [feedbackText, setFeedbackText] = useState(existingFeedback?.text || '');
  const { showToast } = useToastContext();
  const localize = useLocalize();

  const handleSave = () => {
    if (!feedbackText.trim()) {
      showToast({
        message: localize('com_ui_field_required'),
        status: 'error',
      });
      return;
    }

    // Preserve existing rating and tag if they exist
    const newFeedback: TFeedback = {
      text: feedbackText.trim(),
      rating: existingFeedback?.rating,
      tag: existingFeedback?.tag,
    };

    console.log('[TextFeedbackDialog] Sending feedback:', newFeedback);
    handleFeedback({ feedback: newFeedback });

    showToast({
      message: localize('com_ui_saved'),
      status: 'success',
    });
    onOpenChange(false);
  };

  const handleClear = () => {
    setFeedbackText('');
    // Clear only the text, preserve rating and tag
    const clearedFeedback: TFeedback | undefined = existingFeedback?.rating
      ? {
          rating: existingFeedback.rating,
          tag: existingFeedback.tag,
          text: undefined,
        }
      : undefined;
    handleFeedback({ feedback: clearedFeedback });
    showToast({
      message: localize('com_ui_cleared'),
      status: 'success',
    });
    onOpenChange(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  };

  return (
    <OGDialog open={open} onOpenChange={onOpenChange}>
      <OGDialogTemplate
        title={localize('com_ui_feedback_text_title')}
        showCloseButton={false}
        className="w-11/12 md:max-w-lg"
        main={
          <div className="space-y-2">
            <Label htmlFor="text-feedback" className="text-sm font-medium text-text-primary">
              {localize('com_ui_feedback_text_label')}
            </Label>
            <textarea
              id="text-feedback"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={localize('com_ui_feedback_text_placeholder')}
              className="min-h-[120px] w-full resize-none rounded-lg border border-border-light bg-transparent px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-heavy placeholder:text-text-tertiary"
              maxLength={1024}
              rows={5}
            />
            <div className="text-right text-xs text-text-secondary">
              {feedbackText.length} / 1024
            </div>
            <p className="text-xs text-text-secondary">
              {localize('com_ui_feedback_text_hint')}
            </p>
          </div>
        }
        buttons={
          <>
            <Button variant="outline" onClick={handleClear} disabled={!feedbackText}>
              {localize('com_ui_clear')}
            </Button>
            <Button variant="submit" onClick={handleSave} disabled={!feedbackText.trim()}>
              {localize('com_ui_save')}
            </Button>
          </>
        }
      />
    </OGDialog>
  );
}
