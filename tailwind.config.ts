import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1E3A5F',
        secondary: '#F4A435',
        success: '#2ECC71',
        error: '#E74C3C',
        maths: '#3B82F6',
        english: '#8B5CF6',
        verbal: '#10B981',
        nonverbal: '#F59E0B',
        bg: '#F8F9FA',
        surface: '#FFFFFF',
        'text-primary': '#1A202C',
        'text-muted': '#64748B',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
