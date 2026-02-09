import { z } from 'zod';

export type TFeedbackRating = 'thumbsUp' | 'thumbsDown';
export const FEEDBACK_RATINGS = ['thumbsUp', 'thumbsDown'] as const;

export const FEEDBACK_REASON_KEYS = [
  // Down
  'not_matched',
  'inaccurate',
  'bad_style',
  'missing_image',
  'unjustified_refusal',
  'not_helpful',
  'other',
  // Up
  'accurate_reliable',
  'creative_solution',
  'clear_well_written',
  'attention_to_detail',
] as const;

export type TFeedbackTagKey = (typeof FEEDBACK_REASON_KEYS)[number];

export interface TFeedbackTag {
  key: TFeedbackTagKey;
  label: string;
  direction: TFeedbackRating;
  icon: string;
}

// --- Tag Registry ---
export const FEEDBACK_TAGS: TFeedbackTag[] = [
  // Thumbs Down
  {
    key: 'not_matched',
    label: 'com_ui_feedback_tag_not_matched',
    direction: 'thumbsDown',
    icon: 'AlertCircle',
  },
  {
    key: 'inaccurate',
    label: 'com_ui_feedback_tag_inaccurate',
    direction: 'thumbsDown',
    icon: 'AlertCircle',
  },
  {
    key: 'bad_style',
    label: 'com_ui_feedback_tag_bad_style',
    direction: 'thumbsDown',
    icon: 'PenTool',
  },
  {
    key: 'missing_image',
    label: 'com_ui_feedback_tag_missing_image',
    direction: 'thumbsDown',
    icon: 'ImageOff',
  },
  {
    key: 'unjustified_refusal',
    label: 'com_ui_feedback_tag_unjustified_refusal',
    direction: 'thumbsDown',
    icon: 'Ban',
  },
  {
    key: 'not_helpful',
    label: 'com_ui_feedback_tag_not_helpful',
    direction: 'thumbsDown',
    icon: 'ThumbsDown',
  },
  {
    key: 'other',
    label: 'com_ui_feedback_tag_other',
    direction: 'thumbsDown',
    icon: 'HelpCircle',
  },
  // Thumbs Up
  {
    key: 'accurate_reliable',
    label: 'com_ui_feedback_tag_accurate_reliable',
    direction: 'thumbsUp',
    icon: 'CheckCircle',
  },
  {
    key: 'creative_solution',
    label: 'com_ui_feedback_tag_creative_solution',
    direction: 'thumbsUp',
    icon: 'Lightbulb',
  },
  {
    key: 'clear_well_written',
    label: 'com_ui_feedback_tag_clear_well_written',
    direction: 'thumbsUp',
    icon: 'PenTool',
  },
  {
    key: 'attention_to_detail',
    label: 'com_ui_feedback_tag_attention_to_detail',
    direction: 'thumbsUp',
    icon: 'Search',
  },
];

export function getTagsForRating(rating: TFeedbackRating): TFeedbackTag[] {
  return FEEDBACK_TAGS.filter((tag) => tag.direction === rating);
}

export const feedbackTagKeySchema = z.enum(FEEDBACK_REASON_KEYS);
export const feedbackRatingSchema = z.enum(FEEDBACK_RATINGS);

// Schema per feedback con rating e tag
export const ratingFeedbackSchema = z.object({
  rating: feedbackRatingSchema,
  tag: feedbackTagKeySchema,
  text: z.string().max(1024).optional(),
});

// Schema per feedback solo-testo (nuovo)
export const textOnlyFeedbackSchema = z.object({
  text: z.string().min(1).max(1024),
  rating: z.undefined().optional(),
  tag: z.undefined().optional(),
});

// Schema principale: union dei due tipi
export const feedbackSchema = z.union([ratingFeedbackSchema, textOnlyFeedbackSchema]);

export type TMinimalFeedback = z.infer<typeof feedbackSchema>;

export type TFeedback = {
  rating?: TFeedbackRating;
  tag?: TFeedbackTag;
  text?: string;
};

export function toMinimalFeedback(feedback: TFeedback | undefined): TMinimalFeedback | undefined {
  console.log('[toMinimalFeedback] Input:', feedback);

  if (!feedback) {
    console.log('[toMinimalFeedback] Feedback is undefined, returning undefined');
    return undefined;
  }

  // Feedback con rating (con o senza text)
  if (feedback.rating && feedback.tag && feedback.tag.key) {
    const result = {
      rating: feedback.rating,
      tag: feedback.tag.key,
      text: feedback.text,
    };
    console.log('[toMinimalFeedback] Rating feedback (with optional text), returning:', result);
    return result;
  }

  // Feedback solo-testo (senza rating)
  if (feedback.text && !feedback.rating) {
    const result = {
      text: feedback.text,
    };
    console.log('[toMinimalFeedback] Text-only feedback, returning:', result);
    return result;
  }

  console.log('[toMinimalFeedback] No valid feedback structure, returning undefined');
  return undefined;
}

export function getTagByKey(key: TFeedbackTagKey | undefined): TFeedbackTag | undefined {
  if (!key) {
    return undefined;
  }
  return FEEDBACK_TAGS.find((tag) => tag.key === key);
}
