import { useEffect } from 'react';
import { driver } from 'driver.js';

export const useTutorial = (isActive: boolean) => {
  useEffect(() => {
    if (!isActive) return;

    const hasSeenTutorial = localStorage.getItem('poly_tutorial_seen');
    if (hasSeenTutorial) return;

    const driverObj = driver({
      showProgress: true,
      animate: true,
      popoverClass: 'poly-driver-popover',
      steps: [
        { 
          element: '#library-header', 
          popover: { 
            title: 'Welcome to PolyDime!', 
            description: 'This is your central hub for all academic materials.',
            side: "bottom", 
            align: 'start' 
          } 
        },
        { 
          element: '#upload-button', 
          popover: { 
            title: 'Upload Your Notes', 
            description: 'Click here to upload your PDF textbooks, notes, or assignments.',
            side: "left", 
            align: 'center' 
          } 
        },
        { 
          element: '#search-bar', 
          popover: { 
            title: 'Quick Search', 
            description: 'Find any document instantly by searching its title or content.',
            side: "bottom", 
            align: 'center' 
          } 
        },
        { 
          element: '#recent-books', 
          popover: { 
            title: 'Pick Up Where You Left Off', 
            description: 'Your most recently read books appear here for quick access.',
            side: "top", 
            align: 'center' 
          } 
        },
        { 
          element: '.w-16.h-16.bg-accent', // ChatBot FAB
          popover: { 
            title: 'Need Help?', 
            description: 'PolyBot is always here to answer your academic queries.',
            side: "left", 
            align: 'center' 
          } 
        }
      ],
      onDestroyed: () => {
        localStorage.setItem('poly_tutorial_seen', 'true');
      }
    });

    // Small delay to ensure elements are rendered
    const timer = setTimeout(() => {
      driverObj.drive();
    }, 1000);

    return () => clearTimeout(timer);
  }, [isActive]);
};
