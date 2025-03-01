/* document.addEventListener("DOMContentLoaded", async function () {
    const surveyContainer = document.getElementById("survey-form");
    if (!surveyContainer) return;
  
    const response = await fetch("https://yourbackend.com/api/survey");
    const questions = await response.json();
  
    let formHtml = '<form id="surveySubmission">';
    questions.forEach((q, index) => {
      formHtml += `<label>${q.question}</label>`;
      if (q.type === "text") {
        formHtml += `<input type="text" name="q${index}" required />`;
      } else if (q.type === "radio") {
        q.options.forEach((opt) => {
          formHtml += `<input type="radio" name="q${index}" value="${opt}" /> ${opt}`;
        });
      } else if (q.type === "checkbox") {
        q.options.forEach((opt) => {
          formHtml += `<input type="checkbox" name="q${index}" value="${opt}" /> ${opt}`;
        });
      }
      formHtml += "<br>";
    });
    formHtml += `<button type="submit">Submit</button></form>`;
    surveyContainer.innerHTML = formHtml;
  
    document.getElementById("surveySubmission").addEventListener("submit", async function (event) {
      event.preventDefault();
      const formData = new FormData(event.target);
      const data = [];
      questions.forEach((q, index) => {
        data.push({ questionId: q._id, answer: formData.getAll(`q${index}`) });
      });
  
      await fetch("https://yourbackend.com/api/survey-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop: Shopify.shop, responses: data }),
      });
  
      alert("Survey submitted!");
    });
  });
   */

  document.addEventListener("DOMContentLoaded", async function () {
    const surveyContainer = document.getElementById("survey-form");
    if (!surveyContainer) return;
  
    // Dummy survey data for testing
    const questions = [
      {
        _id: "1",
        question: "How did you hear about us?",
        type: "radio",
        options: ["Social Media", "Friend", "Google", "Other"]
      },
      {
        _id: "2",
        question: "What product category interests you the most?",
        type: "checkbox",
        options: ["Clothing", "Electronics", "Accessories", "Home Decor"]
      },
      {
        _id: "3",
        question: "Any additional comments or feedback?",
        type: "text",
        options: []
      }
    ];
  
    let formHtml = '<form id="surveySubmission">';
    questions.forEach((q, index) => {
      formHtml += `<label>${q.question}</label><br>`;
  
      if (q.type === "text") {
        formHtml += `<input type="text" name="q${index}" required /><br>`;
      } else if (q.type === "radio") {
        q.options.forEach((opt) => {
          formHtml += `<input type="radio" name="q${index}" value="${opt}" /> ${opt}<br>`;
        });
      } else if (q.type === "checkbox") {
        q.options.forEach((opt) => {
          formHtml += `<input type="checkbox" name="q${index}" value="${opt}" /> ${opt}<br>`;
        });
      }
      formHtml += "<br>";
    });
  
    formHtml += `<button type="submit">Submit</button></form>`;
    surveyContainer.innerHTML = formHtml;
  
    document.getElementById("surveySubmission").addEventListener("submit", function (event) {
      event.preventDefault();
      alert("Survey submitted! (Dummy data used, no backend call)");
    });
  });

  
 