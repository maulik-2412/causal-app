import { useState, useEffect } from "react"
import {
  Card,
  Page,
  Layout,
  TextField,
  Select,
  RadioButton,
  Button,
  BlockStack,
  InlineStack,
  Text,
  SkeletonBodyText,
  Banner,
  RangeSlider,
  
} from "@shopify/polaris"


// Dummy question types
const QUESTION_TYPES = {
  TEXT: "text",
  MULTIPLE_CHOICE: "multiple_choice",
  YES_NO: "yes_no",
  SCALE: "scale",
}

// Dummy backend function that returns all questions
const fetchQuestionsFromBackend = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          type: QUESTION_TYPES.TEXT,
          content: "How did you hear about our store?",
          placeholder: "Your answer here...",
        },
        {
          type: QUESTION_TYPES.MULTIPLE_CHOICE,
          content: "What influenced your purchase decision the most?",
          options: ["Price", "Quality", "Reviews", "Recommendation", "Other"],
        },
        {
          type: QUESTION_TYPES.YES_NO,
          content: "Would you recommend our products to others?",
        },
        {
          type: QUESTION_TYPES.SCALE,
          content: "How likely are you to shop with us again?",
          min: 1,
          max: 10,
          minLabel: "Not likely",
          maxLabel: "Very likely",
        },
      ])
    }, 1000) // Simulate network delay
  })
}

const CartQuestionForm = () => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setLoading(true)
    fetchQuestionsFromBackend()
      .then((data) => {
        setQuestions(data)

        // Initialize answers state based on question type
        const initialAnswers = {}
        data.forEach((q) => {
          if (q.type === QUESTION_TYPES.MULTIPLE_CHOICE) {
            initialAnswers[q.content] = q.options[0]
          } else if (q.type === QUESTION_TYPES.RATING) {
            initialAnswers[q.content] = "0"
          } else if (q.type === QUESTION_TYPES.YES_NO) {
            initialAnswers[q.content] = "no"
          } else if (q.type === QUESTION_TYPES.SCALE) {
            initialAnswers[q.content] = Math.floor((q.min + q.max) / 2).toString()
          } else {
            initialAnswers[q.content] = ""
          }
        })
        setAnswers(initialAnswers)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const handleAnswerChange = (questionContent, value) => {
    setAnswers((prev) => ({ ...prev, [questionContent]: value }))
  }

  const handleSubmit = () => {
    // Check if any required answers are empty
    const emptyAnswers = questions
      .filter((q) => q.type === QUESTION_TYPES.TEXT && !answers[q.content])
      .map((q) => q.content)

    if (emptyAnswers.length > 0) {
      setError(`Please provide answers for: ${emptyAnswers.join(", ")}`)
      return
    }

    // Simulate sending data to backend
    console.log("Submitting answers:", answers)

    setSubmitted(true)
    setError("")
  }

  const renderQuestionInput = (question) => {
    switch (question.type) {
      case QUESTION_TYPES.TEXT:
        return (
          <TextField
            label=""
            value={answers[question.content]}
            onChange={(value) => handleAnswerChange(question.content, value)}
            placeholder={question.placeholder}
            autoComplete="off"
          />
        )

      case QUESTION_TYPES.MULTIPLE_CHOICE:
        return (
          <Select
            label=""
            options={question.options.map((option) => ({ label: option, value: option }))}
            value={answers[question.content]}
            onChange={(value) => handleAnswerChange(question.content, value)}
          />
        )

      

      case QUESTION_TYPES.YES_NO:
        return (
          <BlockStack>
            <RadioButton
              label="Yes"
              checked={answers[question.content] === "yes"}
              id={`yes-${question.content}`}
              name={question.content}
              onChange={() => handleAnswerChange(question.content, "yes")}
            />
            <RadioButton
              label="No"
              checked={answers[question.content] === "no"}
              id={`no-${question.content}`}
              name={question.content}
              onChange={() => handleAnswerChange(question.content, "no")}
            />
          </BlockStack>
        )

      case QUESTION_TYPES.SCALE:
        return (
          <BlockStack>
            <RangeSlider
              output
              label=""
              min={question.min}
              max={question.max}
              value={Number.parseInt(answers[question.content])}
              onChange={(value) => handleAnswerChange(question.content, value.toString())}
            />
            <InlineStack align="space-evenly">
            <InlineStack gap={400}>
              <InlineStack>{question.minLabel}</InlineStack>
              
            </InlineStack>
            <InlineStack gap={400}>
              
              <InlineStack>{question.maxLabel}</InlineStack>
            </InlineStack>
            </InlineStack>
          </BlockStack>
        )

      default:
        return null
    }
  }

  if (submitted) {
    return (
      <Card sectioned>
        <Banner status="success">
          <p>Thank you for your feedback!</p>
        </Banner>
      </Card>
    )
  }

  return (
    <Card sectioned>
      <BlockStack>
        {loading ? (
          <>
            <Text variant="headingMd" as="h2">Loading questions...</Text>
            <SkeletonBodyText lines={5} />
          </>
        ) : (
          <>
            {questions.map((question, index) => (
              <div key={index} style={{ marginBottom: "1rem" }}>
                <Text variant="headingMd" as="h2">{question.content}</Text>
                {renderQuestionInput(question)}
              </div>
            ))}

            {error && <Banner status="critical">{error}</Banner>}
            <div style={{ marginTop: "1rem" }}>
              <Button primary onClick={handleSubmit}>
                Submit
              </Button>
            </div>
          </>
        )}
      </BlockStack>
    </Card>
  )
}

// Page Wrapper Component
export default function SurveyForm() {
  return (
    <Page narrowWidth>
      <Layout>
        <Layout.Section>
          <CartQuestionForm />
        </Layout.Section>
      </Layout>
    </Page>
  )
}
