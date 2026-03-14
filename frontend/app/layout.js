import './globals.css';

export const metadata = {
  title: 'MobsForSub - Free Sports Community on WhatsApp',
  description: 'Join the biggest sports fan community on WhatsApp at mobsforsub.com. Cricket, Football, Kabaddi & more — completely free!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
