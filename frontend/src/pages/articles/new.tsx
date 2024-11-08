import { FormEvent, useState } from "react";
import formStyles from "../../styles/Form.module.scss";

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const NewDiscussion = () => {
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState<string[]>([]);
  const [source, setSource] = useState("");
  const [pubYear, setPubYear] = useState<number>(0);
  const [doi, setDoi] = useState("");
  const [claim, setClaim] = useState("");
  const [evidence, setEvidence] = useState(""); // Added for evidence input

  const submitNewArticle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const concatenatedAuthors = authors.join(", ");

    const articleData = {
      title,
      authors: concatenatedAuthors,
      source,
      pubYear,
      doi,
      claim,
      evidence, // Evidence field included in the submission data
    };
  
    try {
      const response = await fetch(apiUrl ? `${apiUrl}/articles` : 'http://localhost:8082/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Article submitted successfully:', data);
        alert('Article submitted successfully');
      } else {
        console.error('Failed to submit article');
        alert('Failed to submit article');
      }
    } catch (error) {
      console.error('Error submitting article:', error);
      alert('Error submitting article');
    }
  };
  

  // Helper methods for authors array
  const addAuthor = () => {
    setAuthors(authors.concat([""]));
  };

  const removeAuthor = (index: number) => {
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const changeAuthor = (index: number, value: string) => {
    setAuthors(
      authors.map((oldValue, i) => (index === i ? value : oldValue))
    );
  };

  // Return the full form
  return (
    <div className="container">
      <h1>New Article</h1>
      <form className={formStyles.form} onSubmit={submitNewArticle}>
        <label htmlFor="title">Title:</label>
        <input
          className={formStyles.formItem}
          type="text"
          name="title"
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <label htmlFor="author">Authors:</label>
        {authors.map((author, index) => (
          <div key={`author ${index}`} className={formStyles.arrayItem}>
            <input
              type="text"
              name="author"
              value={author}
              onChange={(event) => changeAuthor(index, event.target.value)}
              className={formStyles.formItem}
            />
            <button
              onClick={() => removeAuthor(index)}
              className={formStyles.buttonItem}
              style={{ marginLeft: "3rem" }}
              type="button"
            >
              -
            </button>
          </div>
        ))}
        <button
          onClick={addAuthor}
          className={formStyles.buttonItem}
          style={{ marginLeft: "auto" }}
          type="button"
        >
          +
        </button>

        <label htmlFor="pubYear">Publication Year:</label>
        <input
          className={formStyles.formItem}
          type="number"
          name="pubYear"
          id="pubYear"
          value={pubYear}
          onChange={(event) => {
            const val = event.target.value;
            setPubYear(val === "" ? 0 : parseInt(val));
          }}
        />

        <label htmlFor="doi">DOI:</label>
        <input
          className={formStyles.formItem}
          type="text"
          name="doi"
          id="doi"
          value={doi}
          onChange={(event) => setDoi(event.target.value)}
        />

        <label htmlFor="Claim">Claim:</label>
        <textarea
          className={formStyles.formTextArea}
          name="claim"
          value={claim}
          onChange={(event) => setClaim(event.target.value)}
        />

        <label htmlFor="Evidence">Evidence:</label> {/* Added Evidence field */}
        <textarea
          className={formStyles.formTextArea}
          name="evidence"
          value={evidence}
          onChange={(event) => setEvidence(event.target.value)}
        />

        <button className={formStyles.formItem} type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default NewDiscussion;
