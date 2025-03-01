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
  TextContainer,
  Text,
  SkeletonBodyText,
  Banner,
  RangeSlider,
  Icon,
} from "@shopify/polaris"
import { StarFilledIcon } from "@shopify/polaris-icons"

// Dummy question types
const QUESTION_TYPES = {
  TEXT: "text",
  MULTIPLE_CHOICE: "multiple_choice",
  RATING: "rating",
  YES_NO: "yes_no",
  SCALE: "scale",
}

// Dummy backend data
const fetchQuestionFromBackend = () => {
  // Simulate API call with a random question type
  const questionTypes = Object.values(QUESTION_TYPES)
  const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)]

  const questions = {
    [QUESTION_TYPES.TEXT]: {
      type: QUESTION_TYPES.TEXT,
      content: "How did you hear about our store?",
      placeholder: "Your answer here...",
    },
    [QUESTION_TYPES.MULTIPLE_CHOICE]: {
      type: QUESTION_TYPES.MULTIPLE_CHOICE,
      content: "What influenced your purchase decision the most?",
      options: ["Price", "Quality", "Reviews", "Recommendation", "Other"],
    },
    [QUESTION_TYPES.RATING]: {
      type: QUESTION_TYPES.RATING,
      content: "How would you rate your shopping experience?",
      maxRating: 5,
    },
    [QUESTION_TYPES.YES_NO]: {
      type: QUESTION_TYPES.YES_NO,
      content: "Would you recommend our products to others?",
    },
    [QUESTION_TYPES.SCALE]: {
      type: QUESTION_TYPES.SCALE,
      content: "How likely are you to shop with us again?",
      min: 1,
      max: 10,
      minLabel: "Not likely",
      maxLabel: "Very likely",
    },
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(questions[randomType])
    }, 1000) // Simulate network delay
  })
}

const CartQuestionForm = () => {
  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answer, setAnswer] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Fetch question from backend
    setLoading(true)
    fetchQuestionFromBackend()
      .then((data) => {
        setQuestion(data)
        // Initialize answer state based on question type
        if (data.type === QUESTION_TYPES.MULTIPLE_CHOICE) {
          setAnswer(data.options[0])
        } else if (data.type === QUESTION_TYPES.RATING) {
          setAnswer("0")
        } else if (data.type === QUESTION_TYPES.YES_NO) {
          setAnswer("no")
        } else if (data.type === QUESTION_TYPES.SCALE) {
          setAnswer(Math.floor((data.min + data.max) / 2).toString())
        } else {
          setAnswer("")
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const handleSubmit = () => {
    if (!answer && question?.type === QUESTION_TYPES.TEXT) {
      setError("Please provide an answer")
      return
    }

    // Simulate sending data to backend
    console.log("Submitting answer:", { questionType: question?.type, questionContent: question?.content, answer })

    // Show success message
    setSubmitted(true)
    setError("")
  }

  const renderQuestionInput = () => {
    if (!question) return null

    switch (question.type) {
      case QUESTION_TYPES.TEXT:
        return (
          <TextField
            label=""
            value={answer}
            onChange={setAnswer}
            placeholder={question.placeholder}
            autoComplete="off"
          />
        )

      case QUESTION_TYPES.MULTIPLE_CHOICE:
        return (
          <Select
            label=""
            options={question.options.map((option) => ({ label: option, value: option }))}
            value={answer}
            onChange={setAnswer}
          />
        )

      case QUESTION_TYPES.RATING:
        return (
          <BlockStack distribution="fillEvenly" spacing="tight">
            {[...Array(question.maxRating)].map((_, index) => {
              const rating = index + 1
              return (
                <Button
                  key={rating}
                  onClick={() => setAnswer(rating.toString())}
                  plain={Number.parseInt(answer) !== rating}
                >
                  <Icon source={StarFilledIcon} color={Number.parseInt(answer) >= rating ? "warning" : "subdued"} />
                </Button>
              )
            })}
          </BlockStack>
        )

      case QUESTION_TYPES.YES_NO:
        return (
          <BlockStack>
            <RadioButton
              label="Yes"
              checked={answer === "yes"}
              id="yes"
              name="yesNo"
              onChange={() => setAnswer("yes")}
            />
            <RadioButton label="No" checked={answer === "no"} id="no" name="yesNo" onChange={() => setAnswer("no")} />
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
              value={Number.parseInt(answer)}
              onChange={(value) => setAnswer(value.toString())}
            />
            <BlockStack>
              <TextContainer>{question.minLabel}</TextContainer>
              <TextContainer>{question.maxLabel}</TextContainer>
            </BlockStack>
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
      <BlockStack >
        {loading ? (
          <>
            <Text variant="headingMd" as="h2">Loading question...</Text>
            <SkeletonBodyText lines={2} />
          </>
        ) : (
          <>
            <Text variant="headingMd" as="h2">{question?.content}</Text>
            {renderQuestionInput()}
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

// Demo component to show the form in a cart-like context
export default function SurveyForm() {
  return (
    <Page narrowWidth>
      <Layout>
        <Layout.Section>
          <Card sectioned title="Your Cart">
            <BlockStack vertical>
              <BlockStack alignment="center">
                <div style={{ width: 50, height: 50, background: "#f4f6f8", borderRadius: "4px" }}></div>
                <BlockStack>
                  <TextContainer>
                    <p>
                      <strong>Organic Cotton T-Shirt</strong>
                    </p>
                    <p>Size: Medium, Color: Blue</p>
                  </TextContainer>
                </BlockStack>
                <p>$29.99</p>
              </BlockStack>

              <BlockStack align="center">
                <div style={{ width: 50, height: 50, background: "#f4f6f8", borderRadius: "4px" }}></div>
                <BlockStack>
                  <TextContainer>
                    <p>
                      <strong>Eco-Friendly Water Bottle</strong>
                    </p>
                    <p>Color: Green</p>
                  </TextContainer>
                </BlockStack>
                <p>$24.99</p>
              </BlockStack>

              <div style={{ borderTop: "1px solid #dfe3e8", margin: "16px 0" }}></div>

              <BlockStack >
                <TextContainer>
                  <p>
                    <strong>Subtotal</strong>
                  </p>
                </TextContainer>
                <TextContainer>
                  <p>
                    <strong>$54.98</strong>
                  </p>
                </TextContainer>
              </BlockStack>

              <Button primary fullWidth>
                Proceed to Checkout
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <CartQuestionForm />
        </Layout.Section>
      </Layout>
    </Page>
  )
}