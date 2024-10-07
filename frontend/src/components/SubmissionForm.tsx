import React from "react";
import { useForm } from "react-hook-form";

export default function SubmissionForm() {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    // Log form data to verify if pubyear is included
    console.log("Form data being sent to the backend:", data);

    // Submit form data to the backend
    fetch('http://localhost:8082/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => console.log('Article submitted successfully:', data))
    .catch(error => console.error('Error:', error));
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
        {/* Ensure the key is named `pubyear` to match the backend */}
        <input {...register("pubyear")} placeholder="Publication Year" type="number" />
      </p>
      <p>
        <input {...register("doi")} placeholder="DOI" />
      </p>

      <select {...register("linked_discussion")}>
        <option value="">Select SE practice...</option>
        <option value="TDD">TDD</option>
        <option value="Mob Programming">Mob Programming</option>
      </select>
      <input type="submit" />
    </form>
  );
}
