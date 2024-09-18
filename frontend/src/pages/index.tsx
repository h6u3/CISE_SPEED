import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <h1>Software Practice Empirical Evidence Database (SPEED)</h1>

      {/* Add a button to link to EmailAlert */}
      <Link href="/EmailAlert">
        <button>Go to Email Alert</button>
      </Link>
    </div>
  );
}
