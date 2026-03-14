'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { publicApi } from '../lib/api';

const WA_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

function WhatsAppCTA({ href, label, large, onClick }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold rounded-full shadow-lg hover:bg-[#20bd5a] transition-all duration-200 active:scale-[0.97] w-full ${large ? 'text-lg py-4 px-6' : 'text-base py-3.5 px-6'}`}
    >
      {WA_SVG}
      <span>{label}</span>
    </a>
  );
}


/* ── Confetti burst — shoots from bottom-left & bottom-right corners ── */
const COLORS = ['#25D366','#3b82f6','#f59e0b','#ec4899','#a78bfa','#f97316','#ffffff','#ff4444','#00e5ff','#ffeb3b'];
const COUNT = 50; // pieces per side = 100 total
const CONFETTI_PIECES = [
  ...Array.from({ length: COUNT }, (_, i) => ({
    id: i,
    side: 'left',
    color: COLORS[i % COLORS.length],
    delay: (i * 0.018),
    size: 8 + (i % 5) * 3,
    angle: 5 + i * 1.7,   // fan from 5° to ~90° (wide up-right sweep)
    dist: 180 + (i % 7) * 45,
    shape: i % 4 === 0 ? 50 : i % 4 === 1 ? 0 : 3,
  })),
  ...Array.from({ length: COUNT }, (_, i) => ({
    id: COUNT + i,
    side: 'right',
    color: COLORS[(i + 3) % COLORS.length],
    delay: (i * 0.018),
    size: 8 + (i % 5) * 3,
    angle: 90 + i * 1.7,  // fan from 90° to ~175° (wide up-left sweep)
    dist: 180 + (i % 7) * 45,
    shape: i % 4 === 0 ? 50 : i % 4 === 1 ? 0 : 3,
  })),
];

function ConfettiBurst() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[101] overflow-hidden">
      <style>{`
        @keyframes conf-shoot {
          0%   { transform: translate(0,0) rotate(0deg) scale(1); opacity:1; }
          60%  { opacity:1; }
          100% { transform: translate(var(--cx),var(--cy)) rotate(var(--cr)) scale(0.2); opacity:0; }
        }
        .conf-p {
          position: absolute;
          animation: conf-shoot 1.4s cubic-bezier(.15,.5,.3,1) forwards;
          animation-delay: var(--cd);
          opacity: 0;
        }
      `}</style>
      {CONFETTI_PIECES.map(p => {
        const rad = p.angle * Math.PI / 180;
        // Left side goes right, right side goes left — both arc upward
        const cx = p.side === 'left'
          ? Math.cos(rad) * p.dist
          : -Math.cos(Math.PI - rad) * p.dist;
        const cy = -Math.abs(Math.sin(rad) * p.dist) - 40;
        return (
          <span key={p.id} className="conf-p" style={{
            bottom: '8%',
            left: p.side === 'left' ? '1%' : '99%',
            '--cx': `${cx}px`,
            '--cy': `${cy}px`,
            '--cr': `${(p.angle + p.id) * 5}deg`,
            '--cd': `${p.delay}s`,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.shape,
            boxShadow: `0 0 4px ${p.color}88`,
          }} />
        );
      })}
    </div>
  );
}

/* ── Scroll popup ── */
function RewardPopup({ url, label, content, onWhatsAppClick }) {
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('popup_shown')) return;
    function trigger() {
      if (sessionStorage.getItem('popup_shown')) return;
      setOpen(true);
      setConfetti(true);
      sessionStorage.setItem('popup_shown', '1');
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
      setTimeout(() => setConfetti(false), 1500);
      setTimeout(() => setPulse(true), 1500);
    }
    const onScroll = () => { if (window.scrollY > 80) trigger(); };
    const timer = setTimeout(trigger, 4000);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); clearTimeout(timer); };
  }, []);

  if (!open) return null;

  return (
    <>
      {confetti && <ConfettiBurst />}
      <div className="fixed inset-0 z-[100] flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.72)' }}>
        <div className="w-full max-w-[480px] bg-white rounded-t-3xl overflow-hidden animate-slide-up" style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.35)' }}>

          {/* TOP BANNER */}
          <div className="relative overflow-hidden px-5 pt-5 pb-4 text-white text-center" style={{ background: 'linear-gradient(135deg,#0f3460 0%,#1a1a6e 50%,#16213e 100%)' }}>
            {/* decorative glow */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full opacity-20" style={{ background: 'radial-gradient(circle,#25D366,transparent)' }} />
            <button onClick={() => setOpen(false)} className="absolute top-3 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-lg leading-none transition-colors" aria-label="Close">×</button>

            {/* avatar stack with live dot */}
            <div className="flex justify-center items-center mb-2 gap-2">
              <div className="flex -space-x-2.5">
                {[
                  'https://randomuser.me/api/portraits/men/32.jpg',
                  'https://randomuser.me/api/portraits/women/44.jpg',
                  'https://randomuser.me/api/portraits/men/75.jpg',
                  'https://randomuser.me/api/portraits/women/68.jpg',
                  'https://randomuser.me/api/portraits/men/51.jpg',
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="member"
                    className="w-8 h-8 rounded-full border-2 border-[#1a1a6e] object-cover shrink-0"
                    style={{ zIndex: 5 - i }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-400/30 rounded-full px-2.5 py-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
                </span>
                <span className="text-[10px] text-green-300 font-bold">1,000+ online now</span>
              </div>
            </div>

            <h3 className="text-[17px] font-extrabold tracking-tight leading-snug">🏆 India's #1 Sports<br/>Fan Community</h3>
            <p className="text-[11px] text-blue-200 mt-1">Join 1M+ fans already inside — Join &amp; Connect Today!</p>
          </div>

          {/* FEATURE CARDS */}
          <div className="px-4 pt-3 pb-2 space-y-2">
            {[
              { icon: '📡', bg: 'from-blue-50 to-indigo-50', border: 'border-blue-100', badge: 'LIVE', badgeBg: 'bg-red-500', title: 'Live Match Updates', desc: 'Real-time scores · Commentary · Highlights' },
              { icon: '🎮', bg: 'from-purple-50 to-pink-50', border: 'border-purple-100', badge: '1600+', badgeBg: 'bg-purple-500', title: 'Games & Sports', desc: 'Cricket · Football · Kabaddi · Tennis & more' },
              { icon: '🕐', bg: 'from-green-50 to-emerald-50', border: 'border-green-100', badge: '24×7', badgeBg: 'bg-green-500', title: 'Always-On Support', desc: 'Help available anytime · Never miss an update' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 bg-gradient-to-r ${item.bg} rounded-2xl px-3 py-2.5 border ${item.border}`}>
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl shrink-0">{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[13px] font-extrabold text-gray-800">{item.title}</p>
                    <span className={`text-[8px] font-extrabold text-white px-1.5 py-0.5 rounded-full ${item.badgeBg}`}>{item.badge}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <span className="text-gray-300 text-sm shrink-0">›</span>
              </div>
            ))}
          </div>

          {/* TRUST STRIP */}
          <div className="flex justify-center gap-4 pt-1 pb-2 text-[10px] text-gray-400 font-medium">
            <span className="flex items-center gap-1"><span className="text-green-500">✓</span> Enjoy here</span>
            <span className="flex items-center gap-1"><span className="text-green-500">✓</span> No Spam</span>
            <span className="flex items-center gap-1"><span className="text-green-500">✓</span> Leave Anytime</span>
          </div>

          {/* CTA */}
          <div className="px-4 pb-6">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onWhatsAppClick}
              className={`flex items-center justify-center gap-2 bg-[#25D366] text-white font-extrabold text-base py-4 rounded-2xl w-full shadow-lg transition-all duration-200 active:scale-[0.97] ${pulse ? 'animate-pulse' : ''}`}
              style={{ boxShadow: '0 4px 20px rgba(37,211,102,0.45)' }}
              onMouseEnter={() => setPulse(false)}
            >
              {WA_SVG}
              <span>Join Free on WhatsApp →</span>
            </a>
            <p className="text-[10px] text-gray-400 text-center mt-2">Tap to open WhatsApp instantly</p>
          </div>

        </div>
      </div>
    </>
  );
}

/* ── Animated counter ── */
function CountUp({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const num = parseInt(target?.replace(/\D/g, '') || '0');
    if (!num) { setCount(target || '0'); return; }
    let start = 0;
    const step = Math.ceil(num / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(target); clearInterval(timer); }
      else setCount(start.toLocaleString('en-IN') + suffix);
    }, 30);
    return () => clearInterval(timer);
  }, [target, suffix]);
  return <span>{count}</span>;
}

/* ── Live Join Notifications ── */
const _COUNTRIES = [
  { // India
    m: ['Rahul','Amit','Vikram','Rohan','Arjun','Sahil','Raj','Kiran','Suresh','Dinesh','Ravi','Manoj','Vinod','Naresh','Prakash','Krishna','Mohan','Ganesh','Prasad','Srinivas','Venkat','Satish','Kishore','Pavan','Mahesh','Praveen','Nithin','Nikhil','Raju','Lokesh','Tarun','Naveen','Sanjay','Ramesh','Harish','Vijay','Arun','Rajesh','Deepak','Vivek','Kartik','Akash','Varun','Rohit','Sandeep','Pradeep','Ashok','Srikanth','Sudheer','Navneet'],
    f: ['Priya','Sneha','Ananya','Kavya','Meera','Divya','Pooja','Neha','Lakshmi','Sunita','Deepika','Swati','Pallavi','Rashmi','Rekha','Usha','Geeta','Hema','Vani','Radha','Kamala','Jyothi','Shanthi','Latha','Nirmala','Madhuri','Nalini','Asha','Archana','Bhavani','Sangeetha','Swetha','Anusha','Smriti','Preethi','Sushma','Nandini','Varsha','Shreya','Anjali','Ranjani','Sumitra','Sudha','Indira','Sarala','Vasantha','Bindhu','Ratna','Bhuvana','Geetha'],
    c: ['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Pune','Kolkata','Jaipur','Ahmedabad','Lucknow','Chandigarh','Indore','Bhopal','Nagpur','Patna','Surat','Vadodara','Coimbatore','Kochi','Visakhapatnam','Vijayawada','Madurai','Mangalore','Mysore','Rajkot','Thiruvananthapuram','Tirupati','Warangal','Amritsar','Ludhiana','Agra','Varanasi','Nashik','Aurangabad','Solapur','Thrissur','Jodhpur','Udaipur','Guwahati','Bhubaneswar'],
  },
  { // Pakistan
    m: ['Ali','Usman','Hassan','Bilal','Imran','Farhan','Zain','Tariq','Asad','Hamza','Shahid','Junaid','Kamran','Fahad','Salman','Adeel','Babar','Faisal','Irfan','Khalid','Mudassar','Naeem','Omar','Qasim','Rizwan','Saad','Talha','Waqas','Yasir','Zubair','Aamir','Amir','Danish','Ehsan','Ghulam','Haris','Ijaz','Javed','Kashif','Luqman'],
    f: ['Ayesha','Fatima','Zainab','Sana','Hira','Amna','Nadia','Sara','Maryam','Rabia','Bushra','Fariha','Gulnaz','Hajra','Iqra','Javeria','Kiran','Layla','Madiha','Noor','Parveen','Qurat','Rida','Sidra','Tabassum','Uzma','Veena','Warda','Yasmin','Zara','Aisha','Aliya','Benish','Dua','Erum','Fiza','Ghazala','Humera','Ifra','Jaweria'],
    c: ['Karachi','Lahore','Islamabad','Rawalpindi','Faisalabad','Peshawar','Quetta','Multan','Gujranwala','Hyderabad','Sialkot','Bahawalpur','Sargodha','Sukkur','Larkana','Sheikhupura','Jhang','Rahim Yar Khan','Gujrat','Kasur'],
  },
  { // Vietnam
    m: ['Minh','Duc','Hieu','Tuan','Hung','Nam','Khoa','Long','Binh','Quang','Bao','Duy','Phuc','Trung','Hai','An','Cuong','Dat','Giang','Hoan','Khanh','Lam','Manh','Nghia','Phat','Quan','Son','Thanh','Vu','Xuan','Anh','Chien','Dung','Gia','Huy','Luc','My','Nhat','Phong','Tri'],
    f: ['Linh','Lan','Thu','Huong','Mai','Hoa','Nga','Yen','Thuy','Trang','Nhi','Quynh','Bich','Thanh','Van','An','Chi','Diem','Giang','Hien','Kim','Lien','My','Ngoc','Phuong','Tam','Uyen','Vui','Xuan','Yen','Anh','Cuc','Dung','Ha','Hong','Loan','Nhung','Oanh','Phan','Tuyen'],
    c: ['Hanoi','Ho Chi Minh City','Da Nang','Hue','Nha Trang','Can Tho','Hai Phong','Vung Tau','Bien Hoa','Buon Ma Thuot','Da Lat','Long Xuyen','My Tho','Phan Thiet','Qui Nhon','Rach Gia','Thai Nguyen','Vinh','Nam Dinh','Cam Ranh'],
  },
  { // Nepal
    m: ['Bikash','Sanjay','Dipak','Nabin','Sujan','Anil','Ramesh','Pawan','Sagar','Kiran','Bishal','Roshan','Suresh','Pradeep','Nishant','Aakash','Binod','Chandan','Dinesh','Ganesh','Hari','Ishwar','Jeevan','Kamal','Laxman','Manish','Narayan','Om','Prakash','Rajesh','Santosh','Tilak','Umesh','Vijay','Yam','Ashok','Bimal','Dev','Mukesh','Niraj'],
    f: ['Sita','Anita','Sunita','Puja','Sabina','Nisha','Kabita','Samjhana','Kopila','Mina','Bina','Rekha','Srijana','Pratima','Manisha','Aarati','Binita','Champa','Durga','Gita','Hira','Indira','Jamuna','Kamala','Laxmi','Manju','Namrata','Pabitra','Rita','Saraswoti','Tara','Uma','Yamu','Anju','Bimala','Deepa','Eba','Maya','Nita','Radha'],
    c: ['Kathmandu','Pokhara','Lalitpur','Bhaktapur','Biratnagar','Birgunj','Butwal','Dharan','Hetauda','Itahari','Janakpur','Lahan','Nepalgunj','Siddharthanagar','Tulsipur','Bharatpur','Damak','Ghorahi','Inaruwa','Kirtipur'],
  },
];
const _L = ['A.','B.','C.','D.','G.','J.','K.','L.','M.','N.','P.','R.','S.','T.','V.'];
const JOIN_NAMES = Array.from({ length: 500 }, (_, i) => {
  const country = _COUNTRIES[i % 4];
  const isMale = (i * 7 + 3) % 2 === 0;
  const names = isMale ? country.m : country.f;
  const nm = names[Math.floor(i / 4) % names.length];
  const last = _L[(i * 3 + 1) % _L.length];
  const city = country.c[Math.floor(i / 4) % country.c.length];
  const num = (i % 99) + 1;
  const src = `https://randomuser.me/api/portraits/${isMale ? 'men' : 'women'}/${num}.jpg`;
  return { name: `${nm} ${last}`, city, src };
});

function LiveJoinTicker() {
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(true);
  const [seconds, setSeconds] = useState(2);

  useEffect(() => {
    const timer = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setIndex(prev => (prev + 1) % JOIN_NAMES.length);
        setSeconds(Math.floor(Math.random() * 28) + 2);
        setShow(true);
      }, 500);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const person = JOIN_NAMES[index];

  return (
    <section className="px-4 py-4 bg-white border-t border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
        </span>
        <h2 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Live Community Activity</h2>
      </div>
      <div className={`transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-4 py-3">
          <div className="relative shrink-0">
            <img src={person.src} alt={person.name} className="w-10 h-10 rounded-full object-cover shadow-sm border-2 border-green-200" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-[7px]">✓</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-gray-800 truncate">{person.name} <span className="font-normal text-gray-500">from {person.city}</span></p>
            <p className="text-[11px] text-green-600 font-semibold">joined the community · {seconds} sec ago</p>
          </div>
        </div>
      </div>
      <div className="flex items-center mt-3">
        <div className="flex -space-x-1.5">
          {JOIN_NAMES.slice(0, 5).map((p, i) => (
            <img key={i} src={p.src} alt={p.name} className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm" />
          ))}
        </div>
        <span className="text-[10px] text-gray-500 font-medium ml-2">+1M joined this community</span>
      </div>
    </section>
  );
}

/* ── Live online counter ── */
function UrgencyCount() {
  const [count, setCount] = useState(null);
  useEffect(() => {
    const base = 1050 + Math.floor(Math.random() * 380);
    setCount(base);
    const t = setInterval(() => setCount(c => Math.max(800, c + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 4 + 1))), 3200);
    return () => clearInterval(t);
  }, []);
  return <>{count ? count.toLocaleString('en-IN') : '...'}</>;
}

function LandingContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [content, setContent] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [c, m] = await Promise.all([
          publicApi.getContent(),
          ref ? publicApi.getMarketer(ref) : Promise.resolve(null),
        ]);
        setContent(c);
        const number = m?.whatsapp_number || c.default_whatsapp || '919876543210';
        const msg = encodeURIComponent(c.whatsapp_message || 'Hi, I want to join the Sports Community');
        setWhatsappUrl(`https://wa.me/${number}?text=${msg}`);
      } catch {
        setWhatsappUrl(`https://wa.me/919876543210?text=${encodeURIComponent('Hi, I want to join the Sports Community')}`);
      }
    }
    load();
  }, [ref]);

  const tracked = useRef(false);
  function handleWhatsAppClick() {
    if (ref && !tracked.current) {
      tracked.current = true;
      publicApi.trackClick(ref).catch(() => {});
    }
  }

  const url = whatsappUrl || '#';
  const ctaLabel = content?.cta_text || 'Join Free on WhatsApp';
  const contactEmail = content?.contact_email || 'support@mobsforsub.com';

  return (
    <>
      <RewardPopup url={url} label={ctaLabel} content={content} onWhatsAppClick={handleWhatsAppClick} />
      <div className="min-h-screen bg-gray-300">
      <div className="max-w-[480px] mx-auto min-h-screen bg-white text-gray-900 shadow-2xl flex flex-col">

        {/* HEADER */}
        <header className="flex items-center justify-between gap-2 px-4 py-2.5 bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-1.5 min-w-0">
            {content?.logo_image ? (
              <img src={content.logo_image} alt="logo" className="w-7 h-7 rounded-md object-contain shrink-0" />
            ) : (
              <span className="text-lg shrink-0">🏆</span>
            )}
            <span className="font-extrabold text-[13px] text-gray-900 truncate leading-tight">
              {content?.site_name || 'MobsForSub'}
            </span>
          </div>
          <a
            href={url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="shrink-0 whitespace-nowrap bg-[#25D366] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide hover:bg-[#20bd5a] transition-colors"
          >
            Play now
          </a>
        </header>

        {/* URGENCY BAR */}
        <div className="flex items-center justify-center gap-2.5 py-2 px-4" style={{ background: 'linear-gradient(90deg,#0a2540,#0f3460)' }}>
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-[11px] font-bold text-white"><UrgencyCount /> members online right now</span>
          <span className="text-white/30">·</span>
          <a href={url} target="_blank" rel="noopener noreferrer" onClick={handleWhatsAppClick} className="text-[11px] text-green-300 font-extrabold hover:text-green-200">Join Free →</a>
        </div>

        {/* HERO */}
        <section className="relative overflow-hidden" style={{ minHeight: '320px', background: '#1a1a2e' }}>
          {content?.hero_image && (
            <img
              src={content.hero_image}
              alt="Sports"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center top' }}
            />
          )}
          {/* nearly transparent at top so the image shines through, dark only at bottom */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.10) 45%, rgba(0,0,0,0.82) 100%)' }} />

          {/* pulsing LIVE badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
            </span>
            LIVE
          </div>

          {/* CTA pinned to bottom inside frosted glass card */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-4">
            <div className="rounded-2xl px-4 pt-3 pb-2" style={{ background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.10)' }}>
              <a href={url} target="_blank" rel="noopener noreferrer" onClick={handleWhatsAppClick}
                className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold rounded-full shadow-lg hover:bg-[#20bd5a] transition-all duration-200 active:scale-[0.97] w-full text-sm py-2.5 px-5">
                {WA_SVG}
                <span>{ctaLabel}</span>
              </a>
              <p className="text-[10px] text-white/65 text-center mt-2">✓ Join now · ✓ All sports covered · ✓ Leave anytime</p>
            </div>
          </div>
        </section>

        {/* STAT STRIP */}
        <section className="grid grid-cols-4 bg-gradient-to-r from-[#0f3460] to-[#1a1a2e] text-white">
          {[
            { v: content?.stat_1_value || '1M+', l: content?.stat_1_label || 'Members' },
            { v: '1600+', l: 'Games' },
            { v: content?.stat_3_value || '10+', l: content?.stat_3_label || 'Sports' },
            { v: 'Daily', l: 'Updates' },
          ].map((s, i) => (
            <div key={i} className="text-center py-3 border-r border-white/10 last:border-r-0">
              <div className="text-sm font-extrabold text-[#25D366] leading-none">{s.v}</div>
              <div className="text-[9px] text-blue-200 mt-0.5">{s.l}</div>
            </div>
          ))}
        </section>
        {/* TESTIMONIALS — infinite marquee */}
        {(() => {
          const MEMBERS = [
            { name: 'Rahul M.', city: 'Mumbai', src: 'https://randomuser.me/api/portraits/men/12.jpg', text: 'Best sports community! Get live scores before TV 🏏' },
            { name: 'Ayesha K.', city: 'Karachi', src: 'https://randomuser.me/api/portraits/women/22.jpg', text: 'Amazing group, I never miss a match now ⚽' },
            { name: 'Minh T.', city: 'Hanoi', src: 'https://randomuser.me/api/portraits/men/45.jpg', text: 'Daily updates, all sports covered. Love it! 🏆' },
            { name: 'Sunita P.', city: 'Delhi', src: 'https://randomuser.me/api/portraits/women/33.jpg', text: 'Super active group. Fast updates every day 🔥' },
            { name: 'Arjun S.', city: 'Pune', src: 'https://randomuser.me/api/portraits/men/15.jpg', text: 'Fastest score alerts I have ever seen! 🏏' },
            { name: 'Fatima N.', city: 'Lahore', src: 'https://randomuser.me/api/portraits/women/44.jpg', text: 'Great community, very supportive members 💚' },
            { name: 'Ravi K.', city: 'Chennai', src: 'https://randomuser.me/api/portraits/men/23.jpg', text: 'Never miss a cricket update now. Superb! ' },
            { name: 'Priya R.', city: 'Bangalore', src: 'https://randomuser.me/api/portraits/women/11.jpg', text: 'Joined 3 months ago, absolutely loving it ' },
            { name: 'Omar A.', city: 'Dubai', src: 'https://randomuser.me/api/portraits/men/31.jpg', text: 'Real-time football scores every single day ⚽' },
            { name: 'Kavya M.', city: 'Hyderabad', src: 'https://randomuser.me/api/portraits/women/55.jpg', text: 'So many sports covered. Best group ever! 🏆' },
            { name: 'Vikram B.', city: 'Kolkata', src: 'https://randomuser.me/api/portraits/men/42.jpg', text: 'IPL updates before anyone else. Love this! 🔥' },
            { name: 'Sara J.', city: 'Jakarta', src: 'https://randomuser.me/api/portraits/women/17.jpg', text: 'Active group with helpful sports fans ' },
            { name: 'Aditya V.', city: 'Ahmedabad', src: 'https://randomuser.me/api/portraits/men/18.jpg', text: 'Match previews, lineups, everything here 📊' },
            { name: 'Nadia H.', city: 'Dhaka', src: 'https://randomuser.me/api/portraits/women/28.jpg', text: 'Highly recommended for sports lovers 💯' },
            { name: 'Suresh L.', city: 'Jaipur', src: 'https://randomuser.me/api/portraits/men/56.jpg', text: 'Consistent updates rain or shine. Great work 👍' },
            { name: 'Meena T.', city: 'Colombo', src: 'https://randomuser.me/api/portraits/women/39.jpg', text: 'Friendly group and always on time 🕐' },
            { name: 'Hassan R.', city: 'Cairo', src: 'https://randomuser.me/api/portraits/men/67.jpg', text: 'Football scores from every league here ⚽🔴' },
            { name: 'Deepa C.', city: 'Kochi', src: 'https://randomuser.me/api/portraits/women/61.jpg', text: 'Love the vibe here. Very positive community ' },
            { name: 'Sanjay G.', city: 'Nagpur', src: 'https://randomuser.me/api/portraits/men/74.jpg', text: 'Never been this connected to sports news ' },
            { name: 'Yasmin F.', city: 'Kuala Lumpur', src: 'https://randomuser.me/api/portraits/women/72.jpg', text: 'Great place for badminton fans too 🏸' },
            { name: 'Karthik N.', city: 'Coimbatore', src: 'https://randomuser.me/api/portraits/men/81.jpg', text: 'IPL, FIFA, Olympics — they cover all! 🏅' },
            { name: 'Layla M.', city: 'Beirut', src: 'https://randomuser.me/api/portraits/women/83.jpg', text: 'So glad I joined. Updates are instant ⚡' },
            { name: 'Pranav D.', city: 'Surat', src: 'https://randomuser.me/api/portraits/men/88.jpg', text: 'The best WhatsApp sports group period ' },
            { name: 'Ananya S.', city: 'Mysore', src: 'https://randomuser.me/api/portraits/women/90.jpg', text: 'Scores, analysis, memes — all in one 😄' },
            { name: 'Tariq B.', city: 'Islamabad', src: 'https://randomuser.me/api/portraits/men/5.jpg', text: 'Pakistan cricket updates are too good 🏏🇵🇰' },
            { name: 'Reshma V.', city: 'Pune', src: 'https://randomuser.me/api/portraits/women/4.jpg', text: 'Stay up to date on every sport easily 📡' },
            { name: 'Mohit J.', city: 'Indore', src: 'https://randomuser.me/api/portraits/men/8.jpg', text: 'Super fast admins and great content 💪' },
            { name: 'Zara Q.', city: 'Dhaka', src: 'https://randomuser.me/api/portraits/women/7.jpg', text: 'Always sharing before newspapers do 📰' },
            { name: 'Naveen R.', city: 'Vijayawada', src: 'https://randomuser.me/api/portraits/men/14.jpg', text: 'Kabaddi and cricket both covered well ' },
            { name: 'Hina S.', city: 'Faisalabad', src: 'https://randomuser.me/api/portraits/women/16.jpg', text: 'Simple, no spam, pure sports updates 🎯' },
            { name: 'Gautam P.', city: 'Lucknow', src: 'https://randomuser.me/api/portraits/men/19.jpg', text: 'Joined for cricket, stayed for everything 😍' },
            { name: 'Pooja K.', city: 'Chandigarh', src: 'https://randomuser.me/api/portraits/women/21.jpg', text: 'Best group I have joined on WhatsApp ' },
            { name: 'Bilal A.', city: 'Multan', src: 'https://randomuser.me/api/portraits/men/26.jpg', text: 'Commentary-style updates are so fun to read 🎙️' },
            { name: 'Shruti N.', city: 'Nagpur', src: 'https://randomuser.me/api/portraits/women/29.jpg', text: 'Women sports coverage is great here ' },
            { name: 'Yusuf M.', city: 'Nairobi', src: 'https://randomuser.me/api/portraits/men/34.jpg', text: 'African football news finally included ' },
            { name: 'Aarti D.', city: 'Bhopal', src: 'https://randomuser.me/api/portraits/women/36.jpg', text: 'Friendly admins, fast replies, love it ' },
            { name: 'Rohan C.', city: 'Patna', src: 'https://randomuser.me/api/portraits/men/38.jpg', text: 'Bihar cricket fans unite here 🏏' },
            { name: 'Noor E.', city: 'Amman', src: 'https://randomuser.me/api/portraits/women/41.jpg', text: 'Best source for Middle East sports fans ' },
            { name: 'Vijay T.', city: 'Madurai', src: 'https://randomuser.me/api/portraits/men/47.jpg', text: 'Tamil fans, this is the group for you ✊' },
            { name: 'Simran K.', city: 'Ludhiana', src: 'https://randomuser.me/api/portraits/women/48.jpg', text: 'Punjab fan here and absolutely loving it ' },
            { name: 'Rahim U.', city: 'Chittagong', src: 'https://randomuser.me/api/portraits/men/52.jpg', text: 'Bangladesh cricket updates are on point 🎉' },
            { name: 'Geeta H.', city: 'Varanasi', src: 'https://randomuser.me/api/portraits/women/53.jpg', text: 'Spiritual city, sporty group — perfect combo ⚽' },
            { name: 'Prakash L.', city: 'Rajkot', src: 'https://randomuser.me/api/portraits/men/58.jpg', text: 'Local Gujarat matches even get covered here ' },
            { name: 'Aisha W.', city: 'Baghdad', src: 'https://randomuser.me/api/portraits/women/59.jpg', text: 'Football is life here and this group delivers ⚡' },
            { name: 'Manoj S.', city: 'Kanpur', src: 'https://randomuser.me/api/portraits/men/63.jpg', text: 'Keeps me sane during busy match seasons ' },
            { name: 'Divya R.', city: 'Trivandrum', src: 'https://randomuser.me/api/portraits/women/64.jpg', text: 'Kerala fans have the best reactions here ' },
            { name: 'Zahir N.', city: 'Kabul', src: 'https://randomuser.me/api/portraits/men/69.jpg', text: 'Sports unites us all. Great community! ' },
            { name: 'Pallavi M.', city: 'Nashik', src: 'https://randomuser.me/api/portraits/women/70.jpg', text: 'Get match schedules daily. So helpful ' },
            { name: 'Sameer A.', city: 'Hyderabad (PK)', src: 'https://randomuser.me/api/portraits/men/76.jpg', text: 'PSL and T20 updates are fantastic here 🏏' },
            { name: 'Ritu B.', city: 'Agra', src: 'https://randomuser.me/api/portraits/women/77.jpg', text: 'Watch parties organised through this group ' },
            { name: 'Irfan H.', city: 'Dhaka', src: 'https://randomuser.me/api/portraits/men/82.jpg', text: 'Smooth group, no drama, pure sports ' },
            { name: 'Tanvi G.', city: 'Vadodara', src: 'https://randomuser.me/api/portraits/women/85.jpg', text: 'Even chess and carrom updates. Wow! ♟️' },
            { name: 'Rohit C.', city: 'Jamshedpur', src: 'https://randomuser.me/api/portraits/men/91.jpg', text: 'ISL football fans assemble here ⚽' },
            { name: 'Uzma B.', city: 'Quetta', src: 'https://randomuser.me/api/portraits/women/93.jpg', text: 'Quick notifications for every match ' },
          ];
          const doubled = [...MEMBERS, ...MEMBERS];
          return (
            <section className="bg-white border-t border-gray-100 pt-4 pb-6">
              <h2 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-4 mb-3">What Members Say</h2>
              <style>{`
                @keyframes marquee-roll {
                  0%   { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .marquee-track {
                  display: flex;
                  gap: 12px;
                  width: max-content;
                  animation: marquee-roll 140s linear infinite;
                  will-change: transform;
                }
              `}</style>
              <div style={{ overflowX: 'clip' }}>
                <div className="marquee-track py-1">
                  {doubled.map((t, i) => (
                    <div key={i} className="flex-shrink-0 w-48 bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-100 p-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <img src={t.src} alt={t.name} className="w-8 h-8 rounded-full object-cover border-2 border-green-100" />
                        <div>
                          <p className="text-[12px] font-bold text-gray-800 leading-none">{t.name}</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">{t.city}</p>
                        </div>
                      </div>
                      <div className="text-yellow-400 text-[11px] mb-1">★★★★★</div>
                      <p className="text-[11px] text-gray-600 leading-snug">&ldquo;{t.text}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })()}
        {/* GAMES GRID — 1600+ */}
        <section className="px-4 py-5 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-extrabold text-gray-800 uppercase tracking-widest">1600+ Games & Sports</h2>
            <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Play now</span>
          </div>
          {/* featured row */}
          <div className="grid grid-cols-4 gap-2 mb-2">
            {[
              { icon: '🏏', name: 'Cricket' },
              { icon: '⚽', name: 'Football' },
              { icon: '🤼', name: 'Kabaddi' },
              { icon: '🏀', name: 'Basketball' },
            ].map((g, i) => (
              <div key={i} className="flex flex-col items-center bg-gradient-to-b from-blue-50 to-white rounded-xl py-2.5 border border-blue-100 shadow-sm">
                <span className="text-2xl">{g.icon}</span>
                <span className="text-[10px] font-semibold text-gray-700 mt-0.5">{g.name}</span>
              </div>
            ))}
          </div>
          {/* secondary row */}
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { icon: '🎾', name: 'Tennis' },
              { icon: '🏓', name: 'TT' },
              { icon: '♟️', name: 'Chess' },
              { icon: '🎮', name: 'E-Sports' },
              { icon: '🎲', name: '& More' },
            ].map((g, i) => (
              <div key={i} className="flex flex-col items-center bg-gray-50 rounded-lg py-2 border border-gray-100">
                <span className="text-xl">{g.icon}</span>
                <span className="text-[9px] font-medium text-gray-500 mt-0.5">{g.name}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-2">...and 1600+ more games updated daily</p>
        </section>

        {/* HOW IT WORKS — horizontal timeline */}
        <section className="px-4 py-4 bg-gray-50 border-t border-gray-100">
          <h2 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">3 Simple Steps</h2>
          <div className="flex items-start gap-0">
            {[
              {
                step: '01', title: 'Tap Button', desc: content?.step_1_desc || 'Click the green button below', bg: 'bg-blue-600',
                svg: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 11V6a3 3 0 0 1 6 0v5"/><path d="M6 11h12l-1.5 9H7.5Z"/><path d="M6 11c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2"/></svg>,
              },
              {
                step: '02', title: 'Join Now', desc: content?.step_2_desc || 'Open WhatsApp & join', bg: 'bg-[#25D366]',
                svg: <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
              },
              {
                step: '03', title: 'Enjoy Content', desc: content?.step_3_desc || 'Get daily sports updates', bg: 'bg-blue-600',
                svg: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
              },
            ].map((s, i) => (
              <div key={i} className="flex-1 relative">
                {i < 2 && <div className="absolute top-4 left-1/2 w-full h-[2px] bg-blue-100 z-0" />}
                <div className="relative z-10 flex flex-col items-center text-center px-1">
                  <div className={`w-9 h-9 rounded-full ${s.bg} text-white flex items-center justify-center shadow-md mb-1`}>
                    {s.svg}
                  </div>
                  <span className="text-[9px] font-extrabold text-blue-500 uppercase">{s.step}</span>
                  <p className="text-[11px] font-bold text-gray-800 leading-tight">{s.title}</p>
                  <p className="text-[9px] text-gray-400 leading-tight mt-0.5 hidden sm:block">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MID-PAGE CTA */}
        <div className="px-5 pt-4 pb-5 bg-white border-t-2 border-green-100">
          <p className="text-center text-[13px] font-extrabold text-gray-800 mb-1">🔥 Join for free in 10 seconds</p>
          <p className="text-center text-[10px] text-gray-400 mb-3">Tap the button — WhatsApp opens instantly</p>
          <a href={url} target="_blank" rel="noopener noreferrer" onClick={handleWhatsAppClick}
            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-[15px] py-4 rounded-2xl w-full wa-glow active:scale-[0.97] transition-transform">
            {WA_SVG}<span>{ctaLabel} →</span>
          </a>
          <div className="flex items-center justify-center gap-3 mt-2.5 text-[10px] text-gray-400 font-medium">
            <span className="flex items-center gap-1"><span className="text-green-500">✓</span> Join & Enjoy</span>
            <span className="flex items-center gap-1"><span className="text-green-500">✓</span> No spam</span>
            <span className="flex items-center gap-1"><span className="text-green-500">✓</span> Leave anytime</span>
          </div>
        </div>

        {/* LIVE JOIN ACTIVITY */}
        <LiveJoinTicker />

        {/* FINAL CTA */}
        <section className="px-4 py-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#0f3460 0%,#1a1a2e 60%,#0d1b2a 100%)' }}>
          {/* decorative blobs */}
          <div className="absolute -top-8 -left-8 w-40 h-40 rounded-full opacity-10" style={{ background: 'radial-gradient(circle,#25D366,transparent)' }} />
          <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full opacity-10" style={{ background: 'radial-gradient(circle,#3b82f6,transparent)' }} />

          <div className="relative text-center text-white space-y-4">
            {/* sport icons row */}
            <div className="flex items-center justify-center gap-3">
              {[
                { bg: '#1e3a5f', icon: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M2 12h4m12 0h4M12 2v4m0 12v4"/><path d="M6.34 6.34l2.83 2.83M14.83 14.83l2.83 2.83M6.34 17.66l2.83-2.83M14.83 9.17l2.83-2.83"/></svg> },
                { bg: '#1a3a2a', icon: <svg viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg> },
                { bg: '#2a1a3a', icon: <svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg> },
              ].map((item, i) => (
                <div key={i} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: item.bg }}>
                  {item.icon}
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-[22px] font-extrabold leading-tight tracking-tight">{content?.final_cta_title || 'Join Our Community Today!'}</h2>
            </div>

            {/* stat pills */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {[
                { label: '1M+ Members', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
                { label: '1600+ Games', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
                { label: 'Join Now', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
              ].map((p, i) => (
                <span key={i} className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${p.color}`}>{p.label}</span>
              ))}
            </div>

            <WhatsAppCTA href={url} label={ctaLabel} large onClick={handleWhatsAppClick} />
          </div>
        </section>

        {/* STICKY CTA */}
        <div className="sticky bottom-0 z-50 px-4 py-3 bg-white border-t border-green-100" style={{ boxShadow: '0 -4px 20px rgba(37,211,102,0.1)' }}>
          <a href={url} target="_blank" rel="noopener noreferrer" onClick={handleWhatsAppClick}
            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-[15px] py-4 rounded-2xl w-full wa-glow active:scale-[0.97] transition-transform">
            {WA_SVG}<span>{ctaLabel} →</span>
          </a>
          <p className="text-center text-[10px] text-gray-400 font-medium mt-1.5">✓ Join Now · ✓ All sports · ✓ Leave anytime</p>
        </div>

        {/* FOOTER */}
        <footer className="pb-4 pt-3 px-4 bg-white border-t border-gray-100 mt-auto">
          <p className="text-[11px] font-bold text-gray-700 text-center mb-1">MobsForSub</p>
          <p className="text-[10px] text-gray-400 text-center leading-relaxed mb-2">
            {content?.disclaimer || 'This is an independent sports fan community group on WhatsApp. By joining you agree to receive messages in the group. You can leave at any time. This page is not affiliated with, endorsed by, or operated by Meta, WhatsApp, or Instagram.'}
          </p>
          <p className="text-[10px] text-gray-500 text-center mb-2">
            📧 <a href={`mailto:${contactEmail}`} className="text-blue-500 hover:underline">{contactEmail}</a>
          </p>
          <div className="flex items-center justify-center gap-x-2.5 gap-y-1 flex-wrap text-[10px] text-blue-500">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <span className="text-gray-300">·</span>
            <Link href="/terms" className="hover:underline">Terms &amp; Conditions</Link>
            <span className="text-gray-300">·</span>
            <Link href="/disclaimer" className="hover:underline">Disclaimer</Link>
          </div>
        </footer>
      </div>
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#25D366] border-t-transparent" />
      </div>
    }>
      <LandingContent />
    </Suspense>
  );
}
