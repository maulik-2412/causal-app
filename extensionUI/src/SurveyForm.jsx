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






const QUESTION_TYPES = {
  TEXT: "text",
  MULTIPLE_CHOICE: "multiple_choice",
  YES_NO: "boolean",
  SCALE: "scale",
}

const shop = new URLSearchParams(location.search).get("shop");
console.log(shop);

const fetchQuestionsFromBackend = async (shop) => {
  
  try {
    const response = await fetch(`/apps/api/survey?shop=${shop}`,{
      method:"GET",
      headers:{"ngrok-skip-browser-warning": "true","Content-Type": "application/json","Host": "causalfunnelstore.myshopify.com"},
      
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    // For debugging - log the raw response text
    const rawText = await response.text();
    // Try to parse as JSON only if it's actually JSON
    
    let data;
    try {
      data = JSON.parse(rawText);
      
      return data.questions ? data.questions : [];
    } catch (e) {
      console.error("Failed to parse response as JSON:", e);
      return [];
    }
  } catch (error) {
    console.error("Error fetching questions:", error)
    return []
  }
}

const submitAnswersToBackend = async (shop, answers) => {
  
  try {
    const response = await fetch(`/apps/api/survey/submit`, {
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "true","Content-Type": "application/json","Host": "causalfunnelstore.myshopify.com",
      },
      body: JSON.stringify({ shop:"causalfunnelstore.myshopify.com", answers }),
    })
    return response.ok
  } catch (error) {
    console.error("Error submitting answers:", error)
    return false
  }
}

const CartQuestionForm = ({shop}) => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setLoading(true)
    fetchQuestionsFromBackend(shop)
      .then((data) => {
        setQuestions(data)

        // Initialize answers state based on question type
        const initialAnswers = {}
        data.forEach((q) => {
          if (q.type === QUESTION_TYPES.MULTIPLE_CHOICE) {
            initialAnswers[q._id] = q.options[0]
          } else if (q.type === QUESTION_TYPES.RATING) {
            initialAnswers[q._id] = "0"
          } else if (q.type === QUESTION_TYPES.YES_NO) {
            initialAnswers[q._id] = "no"
          } else if (q.type === QUESTION_TYPES.SCALE) {
            console.log(q);
            initialAnswers[q._id] = Math.floor((Number(q.min) + Number(q.max)) / 2).toString();
          } else {
            initialAnswers[q._id] = ""
          }
        })
        setAnswers(initialAnswers)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const handleAnswerChange = (_id, value) => {
    setAnswers((prev) => ({ ...prev, [_id]: value }))
  }

  const handleSubmit = async () => {
    
    const formattedAnswers = Object.entries(answers).map(([_id, answer]) => ({
      _id,
      answer,
    }));

    if (await submitAnswersToBackend(shop, formattedAnswers)) {
      setSubmitted(true);
      setError("");
    } else {
      setError("Failed to submit responses. Please try again.");
    }
  }

  const renderQuestionInput = (question) => {
    switch (question.type) {
      case QUESTION_TYPES.TEXT:
        return (
          <TextField
            label=""
            value={answers[question._id]}
            onChange={(value) => handleAnswerChange(question._id, value)}
            placeholder={question.placeholder}
            autoComplete="off"
          />
        )

      case QUESTION_TYPES.MULTIPLE_CHOICE:
        return (
          <Select
            label=""
            options={question.options.map((option) => ({ label: option, value: option }))}
            value={answers[question._id]}
            onChange={(value) => handleAnswerChange(question._id, value)}
          />
        )

      

      case QUESTION_TYPES.YES_NO:
        return (
          <BlockStack>
            <RadioButton
              label="Yes"
              checked={answers[question._id] === true}
              id={`yes-${question._id}`}
              name={question._id}
              onChange={() => handleAnswerChange(question._id, true)}
            />
            <RadioButton
              label="No"
              checked={answers[question._id] === false}
              id={`no-${question._id}`}
              name={question._id}
              onChange={() => handleAnswerChange(question._id, false)}
            />
          </BlockStack>
        )

      case QUESTION_TYPES.SCALE:
        { const currentValue = Number.parseInt(answers[question._id])
        return (
          <BlockStack>
            <InlineStack align="center">
              <Text variant="headingLg" as="p" alignment="center">
                {currentValue}
                <Text variant="bodyMd" as="span">
                  {" "}
                  / {question.max}
                </Text>
              </Text>
            </InlineStack>
            <RangeSlider
              output
              label=""
              min={question.min}
              max={question.max}
              value={currentValue}
              onChange={(value) => handleAnswerChange(question._id, value.toString())}
            />
            <InlineStack align="space-between">
              <Text variant="bodyMd">{question.minLabel}</Text>
              <Text variant="bodyMd">{question.maxLabel}</Text>
            </InlineStack>
          </BlockStack>
        ) }

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
                <Text variant="headingMd" as="h2">{question.question_text}</Text>
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
          <CartQuestionForm shop="causalfunnelstore.myshopify.com" />
        </Layout.Section>
      </Layout>
    </Page>
  )
}
