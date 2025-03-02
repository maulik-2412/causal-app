import React from "react";
import ReactDOM from "react-dom/client"; // Import createRoot
import { AppProvider } from "@shopify/polaris";


import "@shopify/polaris/build/esm/styles.css"; // Polaris styles
import SurveyForm from "./SurveyForm";



document.addEventListener("DOMContentLoaded", () => {
  const surveyContainer = document.getElementById("survey-form");

  if (surveyContainer) {
    const root = ReactDOM.createRoot(surveyContainer);
    root.render(
      
      <AppProvider i18n={{}}>
        <SurveyForm />
      </AppProvider>
      
    );
  }
});
