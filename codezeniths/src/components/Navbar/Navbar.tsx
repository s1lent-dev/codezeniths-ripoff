'use client'

import React from 'react'
import Link from 'next/link' 
import { AnimatedThemeToggler } from '../shared/darkmode'

const Navbar = () => {
  return (
    <nav className="fixed p-2 top-0 left-0 right-0 z-50 border-b border-b-foreground-light-shade3 dark:border-b-foreground-dark-shade3 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        
        {/* Left - Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="font-logo typography-h3 tracking-tight text-foreground-dark-shade3 dark:text-foreground-light-shade3">
            Code<span className="text-primary">Zeniths</span>
          </Link>
        </div>

        {/* Center - Navigation Tabs */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/"
            className="px-4 py-2 typography-p text-muted-light dark:text-muted-dark hover:text-body-light hover:dark:text-body-dark rounded-md transition-colors cursor-pointer"
          >
            Home
          </Link>
          <Link
            href="/"
            className="px-4 py-2 typography-p text-muted-light dark:text-muted-dark hover:text-body-light hover:dark:text-body-dark rounded-md transition-colors cursor-pointer"
          >
            Topics
          </Link>
          <Link
            href="/"
            className="px-4 py-2 typography-p text-muted-light dark:text-muted-dark hover:text-body-light hover:dark:text-body-dark rounded-md transition-colors cursor-pointer"
          >
            Problems
          </Link>
          <Link
            href="/"
            className="px-4 py-2 typography-p text-muted-light dark:text-muted-dark hover:text-body-light hover:dark:text-body-dark rounded-md transition-colors cursor-pointer"
          >
            Sheet
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          
          { /* Theme Toggler */ }
          <AnimatedThemeToggler />
          {/* Sign Up Button */}
          <button
            type="button"
            className="
              px-5 py-2 typography-base
              bg-primary text-foreground-light 
              hover:bg-primary/90 
              rounded-md transition-colors
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer
            "
          >
            signup
          </button>

          {/* Optional: Login link if you want both */}
          {/* <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Log in</Link> */}
        </div>

      </div>
    </nav>
  )
}

export default Navbar