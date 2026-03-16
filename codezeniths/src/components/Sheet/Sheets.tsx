'use client'

import { FC } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules"; // ← import these modules
import "swiper/css";
import "swiper/css/pagination";     // for dots
// import "swiper/css/navigation";   // if you later want arrows too

import SheetCard from "./SheetCard";
import { sheetCards } from "./sheetData";

const Sheets: FC = () => {
  return (
    <div className="w-full py-8">
      <h2 className="font-sans typography-h4 mb-10 text-center text-foreground-dark-shade3 dark:text-foreground-light-shade3">
        Choose Your Learning Path!
      </h2>

      <Swiper
        modules={[Autoplay, Pagination]}           // ← register modules
        slidesPerView={1}
        spaceBetween={24}
        breakpoints={{
          768: { slidesPerView: 2, spaceBetween: 32 },
          1280: { slidesPerView: 2, spaceBetween: 40 },
        }}
        autoplay={{
          delay: 3000,              // 5 seconds per slide
          disableOnInteraction: false, // keep autoplay even after user interaction
          pauseOnMouseEnter: true,  // pause when hovering (nice UX)
        }}
        pagination={{
          clickable: true,          // dots are clickable
          dynamicBullets: true,     // makes dots change size based on active slide (looks modern)
          // You can also use: bulletClass, bulletActiveClass if you want custom styling
        }}
        loop={true}                   // ← infinite loop (recommended for carousels)
        className="pb-14"             // extra padding at bottom for dots
      >
        {sheetCards
          .sort((a, b) => a.order - b.order)
          .map((sheet) => (
            <SwiperSlide key={sheet.slug}>
              <SheetCard sheet={sheet} />
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
};

export default Sheets;