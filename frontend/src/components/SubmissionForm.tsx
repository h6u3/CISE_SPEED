import React from "react";
import { useForm } from "react-hook-form";

export default function SubmissionForm() {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    // Log the form data to ensure pubyear is present and properly formatted
    console.log("Form data being sent to the backend:", data);

 
    fetch('http://localhost:8082/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        pubYear: parseInt(data.pubYear), 
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to submit article: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => console.log('Article submitted successfully:', data))
    .catch(error => console.error('Error submitting article:', error));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("title")} placeholder="Title" required />
      <p>
        <input {...register("authors")} placeholder="Authors" />
      </p>
      <p>
        <input {...register("source")} placeholder="Source" />
      </p>
      <p>
        <input {...register("pubYear", { required: true })} placeholder="Publication Year" type="number" />
      </p>
      <p>
        <input {...register("doi")} placeholder="DOI" />
      </p>
      <p>
        <textarea {...register("evidence")} placeholder="Evidence" /> {/* Evidence input */}
      </p>
      <p>
        <select {...register("claim")}>
          <option value="">Select SE practice...</option>
          <option value="TDD">TDD</option>
          <option value="Mob Programming">Mob Programming</option>
        </select>
      </p>
      <input type="submit" />
    </form>
  );
}
