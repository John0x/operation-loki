# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Next.js 15 web application called "kitesurf-map" built with React 19, TypeScript, and Tailwind CSS 4. It uses the modern App Router architecture.

## Commands
- `npm run dev` - Start development server (runs on http://localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture
- **App Router**: Uses Next.js App Router with the `app/` directory structure
- **Layout**: Root layout in `app/layout.tsx` sets up fonts (Geist Sans and Geist Mono) and basic HTML structure
- **Styling**: Tailwind CSS 4 with PostCSS configuration
- **Fonts**: Uses Next.js font optimization with Google Fonts (Geist family)
- **TypeScript**: Fully typed with strict TypeScript configuration

## Key Directories
- `app/` - Next.js App Router pages and layouts
- `public/` - Static assets (SVGs, images)

## Tech Stack
- Next.js 15.3.3 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui components
- Radix UI primitives
- ESLint 9

## shadcn/ui
The project uses shadcn/ui for UI components. Available base components:
- Button (`components/ui/button.tsx`)
- Card (`components/ui/card.tsx`) 
- Input (`components/ui/input.tsx`)
- Label (`components/ui/label.tsx`)
- Textarea (`components/ui/textarea.tsx`)
- Select (`components/ui/select.tsx`)

Add more components with: `npx shadcn@latest add [component-name]`