import { memo } from 'react';

const EmptyTextPart = memo(() => {
  return (
    <div className="submitting relative absolute min-h-[20px] mt-1.5">
      <span className="result-thinking" />
    </div>
  );
});

export default EmptyTextPart;
