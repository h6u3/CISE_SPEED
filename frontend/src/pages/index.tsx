import SearchBar from '../components/nav/SearchBar'; // Adjust the path as needed

export default function Home() {
  return (
    <div className="container">
      <header>
      <h1>Software Practice Empirical Evidence Database (SPEED)</h1>
      </header>
      <main>
        {/* Optional: Add any introduction text or main content here */}
        <section className="hero">
          <p>Welcome to SPEED, your software practice empirical evidence database.</p>
        </section>

        {/* Main content of your homepage */}
        <section className="search-section">
          <h2>Search Articles</h2>
          <SearchBar /> {/* Optional Search Bar */}
        </section>
      </main>

      <footer>
        <p>© 2024 SPEED Project - All Rights Reserved</p>
      </footer>
    </div>
  );
}
