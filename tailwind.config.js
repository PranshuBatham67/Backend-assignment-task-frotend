/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                },
                secondary: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    800: '#1e293b',
                    900: '#0f172a',
                },
                danger: '#ef4444',
                success: '#22c55e',
                warning: '#f59e0b',
            }
        },
    },
    plugins: [],
}
