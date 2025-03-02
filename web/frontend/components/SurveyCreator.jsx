
import { useState, useEffect } from "react";
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
import { useMutation,useQuery } from "react-query"
import { useAppBridge } from "@shopify/app-bridge-react"

export default function SurveyCreator() {
  const app=useAppBridge();
  const shop = new URLSearchParams(location.search).get("shop");
  const [surveyTitle, setSurveyTitle] = useState("")
  const [surveyDescription, setSurveyDescription] = useState("")
  const [questions, setQuestions] = useState([])
  const [activeQuestionId, setActiveQuestionId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState(null)
  const [newOptionText, setNewOptionText] = useState("")

  const { data: surveyData, isLoading } = useQuery(["survey", shop], async () => {
    const response = await fetch(`/api/surveyQuestions?shop=${shop}`);
    if (!response.ok) throw new Error("Failed to fetch survey");
    return response.json();
  }, {
    onSuccess: (data) => {
      if (data && data.survey) {
        setSurveyTitle(data.survey.title || "");
        setSurveyDescription(data.survey.description || "");
        setQuestions(data.survey.questions || []);
      }
    },
    retry: false,
  });

  const questionTypes = [
    { label: "Scale", value: "scale" },
    { label: "Multiple Choice", value: "multiple_choice" },
    { label: "Text Response", value: "text" },
    { label: "Yes/No", value: "boolean" },
  ]

  const handleAddQuestion = () => {
    const newId = questions.length > 0 ? Math.max(...questions.map((q) => q.question_id)) + 1 : 1
    const newQuestion = {
      question_id: newId,
      type: "scale",
      question_text: "",
      options: [],
      min: 1,
      max: 5,
      minLabel: "Poor",
      maxLabel: "Excellent",
    }
    setQuestions([...questions, newQuestion])
    setActiveQuestionId(newId)
  }
  
  const handleQuestionTypeChange = (value, question_id) => {
    setQuestions(
      questions.map((q) => {
        if (q.question_id === question_id) {
          let options = []
          let min = q.min
          let max = q.max
          let minLabel = q.minLabel
          let maxLabel = q.maxLabel

          if (value === "scale") {
            options = []
            min = 1
            max = 5
            minLabel = "Poor"
            maxLabel = "Excellent"
          } else if (value === "boolean") {
            options = ["Yes", "No"]
            min = undefined
            max = undefined
            minLabel = undefined
            maxLabel = undefined
          } else if (value === "multiple_choice") {
            options = ["Option 1"]
            min = undefined
            max = undefined
            minLabel = undefined
            maxLabel = undefined
          } else {
            min = undefined
            max = undefined
            minLabel = undefined
            maxLabel = undefined
          }
          return { ...q, type: value, options, min, max, minLabel, maxLabel }
        }
        return q
      }),
    )
  }
  

  const handleQuestionTextChange = (value, question_id) => {
    setQuestions(questions.map((q) => (q.question_id === question_id ? { ...q, question_text: value } : q)))
  }

  const handleDeleteQuestion = (question_id) => {
    setQuestionToDelete(question_id)
    setShowDeleteModal(true)
  }

  const confirmDeleteQuestion = () => {
    setQuestions(questions.filter((q) => q.question_id !== questionToDelete))
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
        if (q.question_id === questionId) {
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
        if (q.question_id === questionId) {
          const newOptions = [...q.options]
          newOptions.splice(optionIndex, 1)
          return { ...q, options: newOptions }
        }
        return q
      }),
    )
  }

  const saveSurvey = async (surveyData) => {
    const response = await fetch("/api/surveyQuestions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(surveyData),
    });
    
    if (!response.ok) {
      throw new Error("Failed to save survey");
    }
  
    return response.json();
  };
  const mutation = useMutation(saveSurvey, {
    onSuccess: () => {
      setShowSuccessModal(true);
    },
    onError: (error) => {
      console.error("Survey save failed:", error);
      alert("Failed to save survey.");
    },
  });
  
  const handleSaveSurvey = () => {
    // Here you would typically send the data to your backend
    const surveyData = {
      shop:shop,
      title: surveyTitle,
      description: surveyDescription,
      questions,
    };

    mutation.mutate(surveyData);

    // In a real app, you might reset the form or redirect after successful save
  }

  const handleScaleMinChange = (value, question_id) => {
    setQuestions(questions.map((q) => (q.question_id === question_id ? { ...q, min: Number.parseInt(value) || 1 } : q)))
  }

  const handleScaleMaxChange = (value, question_id) => {
    setQuestions(questions.map((q) => (q.question_id === question_id ? { ...q, max: Number.parseInt(value) || 5 } : q)))
  }

  const handleScaleMinLabelChange = (value, question_id) => {
    setQuestions(questions.map((q) => (q.question_id === question_id ? { ...q, minLabel: value } : q)))
  }

  const handleScaleMaxLabelChange = (value, question_id) => {
    setQuestions(questions.map((q) => (q.question_id === question_id ? { ...q, maxLabel: value } : q)))
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
                      <LegacyCard key={question.question_id} sectioned>
                        <BlockStack gap="4">
                          <InlineStack align="space-between">
                            <InlineStack gap="2">
                              <Icon source={DragHandleIcon} color="base" />
                              <Text variant="headingSm" as="h3">
                                Question 
                              </Text>
                            </InlineStack>
                            <Button
                              icon={DeleteIcon}
                              tone="critical"
                              onClick={() => handleDeleteQuestion(question.question_id)}
                              accessibilityLabel="Delete question"
                            />
                          </InlineStack>

                          <FormLayout>
                            <Select
                              label="Question Type"
                              options={questionTypes}
                              value={question.type}
                              onChange={(value) => handleQuestionTypeChange(value, question.question_id)}
                            />

                            <TextField
                              label="Question Text"
                              value={question.question_text}
                              onChange={(value) => handleQuestionTextChange(value, question.question_id)}
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
                                      onClick={() => handleRemoveOption(question.question_id, index)}
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
                                  <Button onClick={() => handleAddOption(question.question_id)}>Add</Button>
                                </InlineStack>
                              </BlockStack>
                            )}
                            {question.type === "scale" && (
                              <BlockStack gap="2">
                                <Text variant="bodySm" as="p">
                                  Scale Configuration
                                </Text>
                                <InlineStack gap="2" align="start">
                                  <div style={{ width: "50%" }}>
                                    <TextField
                                      label="Min Value"
                                      type="number"
                                      value={question.min?.toString() || "1"}
                                      onChange={(value) => handleScaleMinChange(value, question.question_id)}
                                      autoComplete="off"
                                    />
                                  </div>
                                  <div style={{ width: "50%" }}>
                                    <TextField
                                      label="Max Value"
                                      type="number"
                                      value={question.max?.toString() || "5"}
                                      onChange={(value) => handleScaleMaxChange(value, question.question_id)}
                                      autoComplete="off"
                                    />
                                  </div>
                                </InlineStack>
                                <InlineStack gap="2" align="start">
                                  <div style={{ width: "50%" }}>
                                    <TextField
                                      label="Min Label"
                                      value={question.minLabel || ""}
                                      onChange={(value) => handleScaleMinLabelChange(value, question.question_id)}
                                      autoComplete="off"
                                      placeholder="e.g., Poor"
                                    />
                                  </div>
                                  <div style={{ width: "50%" }}>
                                    <TextField
                                      label="Max Label"
                                      value={question.maxLabel || ""}
                                      onChange={(value) => handleScaleMaxLabelChange(value, question.question_id)}
                                      autoComplete="off"
                                      placeholder="e.g., Excellent"
                                    />
                                  </div>
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

