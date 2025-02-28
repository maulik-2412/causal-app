
import { useState } from "react"
import {
  Card,
  Layout,
  FormLayout,
  TextField,
  Select,
  Button,
  InlineStack,
  BlockStack,
  Text,
  Banner,
  Icon,
  Modal,
  EmptyState,
  Page,
  Divider,
  LegacyCard,
} from "@shopify/polaris"
import { DragHandleIcon, DeleteIcon, PlusCircleIcon } from "@shopify/polaris-icons"

export default function SurveyCreator() {
  const [surveyTitle, setSurveyTitle] = useState("")
  const [surveyDescription, setSurveyDescription] = useState("")
  const [questions, setQuestions] = useState([
    { id: 1, type: "rating", text: "How would you rate our product?", options: ["1", "2", "3", "4", "5"] },
    {
      id: 2,
      type: "multiple_choice",
      text: "What features do you like most?",
      options: ["Quality", "Price", "Design", "Functionality"],
    },
    { id: 3, type: "text", text: "Any additional feedback?", options: [] },
  ])
  const [activeQuestionId, setActiveQuestionId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState(null)
  const [newOptionText, setNewOptionText] = useState("")

  const questionTypes = [
    { label: "Rating (1-5)", value: "rating" },
    { label: "Multiple Choice", value: "multiple_choice" },
    { label: "Text Response", value: "text" },
    { label: "Yes/No", value: "boolean" },
  ]

  const handleAddQuestion = () => {
    const newId = questions.length > 0 ? Math.max(...questions.map((q) => q.id)) + 1 : 1
    const newQuestion = {
      id: newId,
      type: "rating",
      text: "",
      options: ["1", "2", "3", "4", "5"],
    }
    setQuestions([...questions, newQuestion])
    setActiveQuestionId(newId)
  }

  const handleQuestionTypeChange = (value, id) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === id) {
          let options = []
          if (value === "rating") {
            options = ["1", "2", "3", "4", "5"]
          } else if (value === "boolean") {
            options = ["Yes", "No"]
          } else if (value === "multiple_choice") {
            options = ["Option 1"]
          }
          return { ...q, type: value, options }
        }
        return q
      }),
    )
  }

  const handleQuestionTextChange = (value, id) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text: value } : q)))
  }

  const handleDeleteQuestion = (id) => {
    setQuestionToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDeleteQuestion = () => {
    setQuestions(questions.filter((q) => q.id !== questionToDelete))
    setShowDeleteModal(false)
    setQuestionToDelete(null)
    if (activeQuestionId === questionToDelete) {
      setActiveQuestionId(null)
    }
  }

  const handleAddOption = (questionId) => {
    if (!newOptionText.trim()) return

    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return { ...q, options: [...q.options, newOptionText] }
        }
        return q
      }),
    )
    setNewOptionText("")
  }

  const handleRemoveOption = (questionId, optionIndex) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options]
          newOptions.splice(optionIndex, 1)
          return { ...q, options: newOptions }
        }
        return q
      }),
    )
  }

  const handleSaveSurvey = () => {
    // Here you would typically send the data to your backend
    console.log({
      title: surveyTitle,
      description: surveyDescription,
      questions,
    })

    // Show success modal
    setShowSuccessModal(true)

    // In a real app, you might reset the form or redirect after successful save
  }

  return (
    <Page fullWidth>
      <BlockStack gap="4">
        <Banner title="Create and customize your customer survey" tone="info">
          <p>Design your survey questions and customize the response types to gather valuable customer feedback.</p>
        </Banner>

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="4">
                <FormLayout>
                  <TextField label="Survey Title" value={surveyTitle} onChange={setSurveyTitle} autoComplete="off" />
                  <TextField
                    label="Survey Description"
                    value={surveyDescription}
                    onChange={setSurveyDescription}
                    multiline={3}
                    autoComplete="off"
                  />
                </FormLayout>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <BlockStack gap="4">
                <Text variant="headingMd" as="h2">
                  Survey Questions
                </Text>

                {questions.length === 0 ? (
                  <EmptyState
                    heading="Add your first question"
                    action={{
                      content: "Add question",
                      onAction: handleAddQuestion,
                    }}
                    image="/placeholder.svg?height=200&width=200"
                  >
                    <p>Start building your survey by adding questions.</p>
                  </EmptyState>
                ) : (
                  <BlockStack gap="4">
                    {questions.map((question) => (
                      <LegacyCard key={question.id} sectioned>
                        <BlockStack gap="4">
                          <InlineStack align="space-between">
                            <InlineStack gap="2">
                              <Icon source={DragHandleIcon} color="base" />
                              <Text variant="headingSm" as="h3">
                                Question {question.id}
                              </Text>
                            </InlineStack>
                            <Button
                              icon={DeleteIcon}
                              tone="critical"
                              onClick={() => handleDeleteQuestion(question.id)}
                              accessibilityLabel="Delete question"
                            />
                          </InlineStack>

                          <FormLayout>
                            <Select
                              label="Question Type"
                              options={questionTypes}
                              value={question.type}
                              onChange={(value) => handleQuestionTypeChange(value, question.id)}
                            />

                            <TextField
                              label="Question Text"
                              value={question.text}
                              onChange={(value) => handleQuestionTextChange(value, question.id)}
                              autoComplete="off"
                            />

                            {question.type === "multiple_choice" && (
                              <BlockStack gap="2">
                                <Text variant="bodySm" as="p">
                                  Answer Options
                                </Text>

                                {question.options.map((option, index) => (
                                  <InlineStack key={index} align="space-between">
                                    <Text variant="bodyMd" as="span">
                                      {option}
                                    </Text>
                                    <Button
                                      plain
                                      icon={DeleteIcon}
                                      onClick={() => handleRemoveOption(question.id, index)}
                                      accessibilityLabel="Remove option"
                                    />
                                  </InlineStack>
                                ))}

                                <InlineStack gap="2">
                                  <TextField
                                    label="New Option"
                                    labelHidden
                                    value={newOptionText}
                                    onChange={setNewOptionText}
                                    autoComplete="off"
                                    placeholder="Enter new option"
                                  />
                                  <Button onClick={() => handleAddOption(question.id)}>Add</Button>
                                </InlineStack>
                              </BlockStack>
                            )}
                          </FormLayout>
                        </BlockStack>
                      </LegacyCard>
                    ))}
                  </BlockStack>
                )}

                <InlineStack>
                  <Button icon={PlusCircleIcon} onClick={handleAddQuestion}>
                    Add Question
                  </Button>
                </InlineStack>

                <Divider />

                <InlineStack align="end">
                  <Button primary onClick={handleSaveSurvey}>
                    Save Survey
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Question"
        primaryAction={{
          content: "Delete",
          onAction: confirmDeleteQuestion,
          destructive: true,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setShowDeleteModal(false),
          },
        ]}
      >
        <Modal.Section>
          <p>Are you sure you want to delete this question? This action cannot be undone.</p>
        </Modal.Section>
      </Modal>

      <Modal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Survey Saved"
        primaryAction={{
          content: "OK",
          onAction: () => setShowSuccessModal(false),
        }}
      >
        <Modal.Section>
          <Banner tone="success">
            <p>Your survey has been saved successfully and is ready to be sent to customers.</p>
          </Banner>
        </Modal.Section>
      </Modal>
    </Page>
  )
}

