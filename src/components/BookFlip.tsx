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
      className="flip-book"
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
        <div key={index} className="page" data-density="hard">
          {props.renderPage(index)}
        </div>
      ))}
    </HTMLFlipBook>
  );
});

BookFlip.displayName = 'BookFlip';
