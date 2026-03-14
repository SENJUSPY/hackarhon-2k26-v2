import React, { forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';

interface BookFlipProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (index: number) => void;
  renderPage: (index: number) => React.ReactNode;
}

export const BookFlip = forwardRef<any, BookFlipProps>((props, ref) => {
  const pages = Array.from({ length: props.totalPages }, (_, i) => i);

  return (
    <div className="flex items-center justify-center w-full h-full py-10">
      <HTMLFlipBook
        width={550}
        height={733}
        size="stretch"
        minWidth={315}
        maxWidth={1000}
        minHeight={400}
        maxHeight={1533}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={true}
        className="flip-book shadow-2xl"
        ref={ref}
        style={{ margin: '0 auto' }}
        startPage={props.currentPage}
        onFlip={(e) => props.onPageChange(e.data)}
        drawShadow={true}
        flippingTime={1000}
        usePortrait={false}
        startZIndex={0}
        autoSize={true}
        clickEventForward={true}
        useMouseEvents={true}
        swipeDistance={30}
        showPageCorners={true}
        disableFlipByClick={false}
      >
        {pages.map((index) => (
          <div key={index} className="page bg-white shadow-inner overflow-hidden" data-density={index === 0 || index === props.totalPages - 1 ? "hard" : "soft"}>
            {props.renderPage(index)}
          </div>
        ))}
      </HTMLFlipBook>
    </div>
  );
});

BookFlip.displayName = 'BookFlip';
