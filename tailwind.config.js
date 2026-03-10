/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--primary)',
                'primary-dark': 'var(--primary-dark)',
                apple: {
                    blue: '#007aff',
                    gray: '#f5f5f7',
                    dark: '#1d1d1f'
                }
            },
            borderRadius: {
                'apple': '20px'
            }
        },
    },
    plugins: [],
}
