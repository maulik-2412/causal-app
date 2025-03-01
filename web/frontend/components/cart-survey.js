import React from "react";
import ReactDOM from "react-dom";
import SurveyForm from "./SurveyForm";

const App = () => <SurveyForm />;

window.onload = function () {
    const container = document.getElementById("survey-form-container");
    if (container) {
        ReactDOM.render(<App />, container);
    }
};
