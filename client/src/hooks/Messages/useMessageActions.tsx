import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useUpdateFeedbackMutation } from 'librechat-data-provider/react-query';
import {
  TFeedback,
  getTagByKey,
  isAgentsEndpoint,
  SearchResultData,
  toMinimalFeedback,
  isAssistantsEndpoint,
  TUpdateFeedbackRequest,
} from 'librechat-data-provider';
import type { TMessageProps } from '~/common';
import { useChatContext, useAssistantsMapContext, useAgentsMapContext } from '~/Providers';
import useCopyToClipboard from './useCopyToClipboard';
import { useAuthContext } from '~/hooks/AuthContext';
import { useGetAddedConvo } from '~/hooks/Chat';
import { useLocalize } from '~/hooks';
import store from '~/store';

export type TMessageActions = Pick<
  TMessageProps,
  'message' | 'currentEditId' | 'setCurrentEditId'
> & {
  searchResults?: { [key: string]: SearchResultData };
};

export default function useMessageActions(props: TMessageActions) {
  const localize = useLocalize();
  const { user } = useAuthContext();
  const UsernameDisplay = useRecoilValue<boolean>(store.UsernameDisplay);
  const { message, currentEditId, setCurrentEditId, searchResults } = props;

  const { ask, index, regenerate, isSubmitting, conversation, latestMessage, handleContinue } =
    useChatContext();

  const getAddedConvo = useGetAddedConvo();

  const agentsMap = useAgentsMapContext();
  const assistantMap = useAssistantsMapContext();

  const { text, content, messageId = null, isCreatedByUser } = message ?? {};
  const edit = useMemo(() => messageId === currentEditId, [messageId, currentEditId]);

  const [feedbackText, setFeedbackText] = useState<string | undefined>(message?.feedbackText);

  useEffect(() => {
    if (message?.feedbackText !== undefined) {
      setFeedbackText(message.feedbackText);
    }
  }, [message?.feedbackText]);

  const [feedback, setFeedback] = useState<TFeedback | undefined>(() => {
    if (message?.feedback) {
      const tagKey = typeof message.feedback.tag === 'string'
        ? message.feedback.tag
        : message.feedback.tag?.key;
      const tag = getTagByKey(tagKey);
      return {
        rating: message.feedback.rating,
        tag,
      };
    }
    return undefined;
  });

  useEffect(() => {
    if (message?.feedback) {
      const tagKey = typeof message.feedback.tag === 'string'
        ? message.feedback.tag
        : message.feedback.tag?.key;
      const tag = getTagByKey(tagKey);

      // Only update if actually different to avoid unnecessary re-renders
      setFeedback((prev) => {
        const isDifferent =
          prev?.rating !== message.feedback.rating ||
          prev?.tag?.key !== tagKey;

        if (isDifferent) {
          return {
            rating: message.feedback.rating,
            tag,
          };
        }
        return prev;
      });
    } else if (!message?.feedback) {
      setFeedback(undefined);
    }
  }, [message?.feedback]);


  const enterEdit = useCallback(
    (cancel?: boolean) => setCurrentEditId && setCurrentEditId(cancel === true ? -1 : messageId),
    [messageId, setCurrentEditId],
  );

  const assistant = useMemo(() => {
    if (!isAssistantsEndpoint(conversation?.endpoint)) {
      return undefined;
    }

    const endpointKey = conversation?.endpoint ?? '';
    const modelKey = message?.model ?? '';

    return assistantMap?.[endpointKey] ? assistantMap[endpointKey][modelKey] : undefined;
  }, [conversation?.endpoint, message?.model, assistantMap]);

  const agent = useMemo(() => {
    if (!isAgentsEndpoint(conversation?.endpoint)) {
      return undefined;
    }

    if (!agentsMap) {
      return undefined;
    }

    const modelKey = message?.model ?? '';
    if (modelKey) {
      return agentsMap[modelKey];
    }

    const agentId = conversation?.agent_id ?? '';
    if (agentId) {
      return agentsMap[agentId];
    }
  }, [agentsMap, conversation?.agent_id, conversation?.endpoint, message?.model]);

  const regenerateMessage = useCallback(() => {
    if ((isSubmitting && isCreatedByUser === true) || !message) {
      return;
    }

    regenerate(message, { addedConvo: getAddedConvo() });
  }, [isSubmitting, isCreatedByUser, message, regenerate, getAddedConvo]);

  const copyToClipboard = useCopyToClipboard({ text, content, searchResults });

  const messageLabel = useMemo(() => {
    if (message?.isCreatedByUser === true) {
      return UsernameDisplay ? (user?.name ?? '') || user?.username : localize('com_user_message');
    } else if (agent) {
      return agent.name ?? 'Assistant';
    } else if (assistant) {
      return assistant.name ?? 'Assistant';
    } else {
      return message?.sender;
    }
  }, [message, agent, assistant, UsernameDisplay, user, localize]);

  const feedbackMutation = useUpdateFeedbackMutation(
    conversation?.conversationId || '',
    message?.messageId || '',
  );

  const handleFeedback = useCallback(
    ({
      feedback: incomingFeedback,
      feedbackText: incomingText,
    }: {
      feedback?: TFeedback;
      feedbackText?: string;
    }) => {
      const payload: TUpdateFeedbackRequest = {};

      if (incomingFeedback !== undefined) {
        payload.feedback = toMinimalFeedback(incomingFeedback);
        setFeedback(incomingFeedback || undefined);
      }

      if (incomingText !== undefined) {
        payload.feedbackText = incomingText ?? null;
        setFeedbackText(incomingText || undefined);
      }

      feedbackMutation.mutate(payload, {
        onSuccess: (data) => {
          if (data.feedback !== undefined) {
            if (!data.feedback) {
              setFeedback(undefined);
            } else {
              const tagKey =
                typeof data.feedback.tag === 'string'
                  ? data.feedback.tag
                  : data.feedback.tag?.key;
              const tag = getTagByKey(tagKey);
              setFeedback({
                rating: data.feedback.rating,
                tag,
              });
            }
          }

          if (data.feedbackText !== undefined) {
            setFeedbackText(data.feedbackText || undefined);
          }
        },
      });
    },
    [feedbackMutation],
  );

  return {
    ask,
    edit,
    index,
    agent,
    feedback,
    feedbackText,
    assistant,
    enterEdit,
    conversation,
    messageLabel,
    latestMessage,
    handleFeedback,
    handleContinue,
    copyToClipboard,
    regenerateMessage,
  };
}
