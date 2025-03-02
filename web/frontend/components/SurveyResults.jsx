

import { useState, useCallback } from "react"
import {
  Card,
  Filters,
  DataTable,
  Page,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Badge,
  Modal,
  EmptySearchResult,
  LegacyCard,
  LegacyTabs,
  ChoiceList,
  TextField,
} from "@shopify/polaris"
import { ViewIcon, ExportIcon } from "@shopify/polaris-icons"
import SurveyAnalytics from "./SurveyAnalytics"
import { useQuery } from "react-query"

export default function SurveyResults() {
  /* const shop = new URLSearchParams(location.search).get("shop");
  const { data, isLoading } = useQuery(["surveyResponses", shop], async () => {
    const response = await fetch(`/api/surveyResponses?shop=${shop}`);
    if (!response.ok) throw new Error("Failed to fetch responses");
    return response.json();
  });
  const responses = data?.responses || [];
  console.log(responses) */
  
  // get stats from backend
  const mockResponses = [
    { id: 1, customer: "John Doe", email: "john@example.com", date: "2023-05-15", rating: 4, completed: true },
    { id: 2, customer: "Jane Smith", email: "jane@example.com", date: "2023-05-14", rating: 5, completed: true },
    { id: 3, customer: "Bob Johnson", email: "bob@example.com", date: "2023-05-13", rating: 3, completed: true },
    { id: 4, customer: "Alice Brown", email: "alice@example.com", date: "2023-05-12", rating: 2, completed: true },
    { id: 5, customer: "Charlie Wilson", email: "charlie@example.com", date: "2023-05-11", rating: 5, completed: true },
    { id: 6, customer: "Diana Miller", email: "diana@example.com", date: "2023-05-10", rating: 4, completed: true },
    { id: 7, customer: "Edward Davis", email: "edward@example.com", date: "2023-05-09", rating: 1, completed: true },
    { id: 8, customer: "Fiona Clark", email: "fiona@example.com", date: "2023-05-08", rating: 3, completed: true },
    { id: 9, customer: "George White", email: "george@example.com", date: "2023-05-07", rating: 4, completed: true },
    { id: 10, customer: "Hannah Green", email: "hannah@example.com", date: "2023-05-06", rating: 5, completed: true },
  ]

  const [responses, setResponses] = useState(mockResponses)
  const [selectedTab, setSelectedTab] = useState(0)
  const [queryValue, setQueryValue] = useState("")
  const [selectedRatings, setSelectedRatings] = useState([])
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [selectedResponse, setSelectedResponse] = useState(null)
  const [sortedColumn, setSortedColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState("asc")

  const handleTabChange = useCallback((selectedTabIndex) => {
    setSelectedTab(selectedTabIndex)
  }, [])

  const handleFiltersQueryChange = useCallback((value) => {
    setQueryValue(value)
  }, [])

  const handleRatingFilterChange = useCallback((value) => {
    setSelectedRatings(value)
  }, [])

  const handleDateRangeChange = useCallback((range) => {
    setDateRange(range)
  }, [])

  const handleClearFilters = useCallback(() => {
    setQueryValue("")
    setSelectedRatings([])
    setDateRange({ start: "", end: "" })
  }, [])

  const handleViewResponse = useCallback(
    (id) => {
      const response = responses.find((r) => r.id === id)
      setSelectedResponse(response)
      setShowResponseModal(true)
    },
    [responses],
  )

  const handleSort = useCallback((index, direction) => {
    setSortedColumn(index)
    setSortDirection(direction)
  }, [])

  
  const filteredResponses = responses.filter((response) => {
    
    const matchesQuery =
      !queryValue ||
      response.customer.toLowerCase().includes(queryValue.toLowerCase()) ||
      response.email.toLowerCase().includes(queryValue.toLowerCase())

    
    const matchesRating = selectedRatings.length === 0 || selectedRatings.includes(response.rating.toString())

    // add date filter
   

    return matchesQuery && matchesRating 
  })

  
  const sortedResponses = [...filteredResponses].sort((a, b) => {
    if (sortedColumn === 0) {
      return sortDirection === "asc" ? a.customer.localeCompare(b.customer) : b.customer.localeCompare(a.customer)
    } else if (sortedColumn === 3) {
      return sortDirection === "asc" ? a.rating - b.rating : b.rating - a.rating
    }
    return 0
  })

  const tabs = [
    {
      id: "all-responses",
      content: "All Responses",
      accessibilityLabel: "All survey responses",
      panelID: "all-responses-panel",
    },
    {
      id: "analytics",
      content: "Analytics",
      accessibilityLabel: "Survey analytics and insights",
      panelID: "analytics-panel",
    },
  ]

  const ratingFilterOptions = [
    { label: "5 Stars", value: "5" },
    { label: "4 Stars", value: "4" },
    { label: "3 Stars", value: "3" },
    { label: "2 Stars", value: "2" },
    { label: "1 Star", value: "1" },
  ]

  const filters = [
    {
      key: "rating",
      label: "Rating",
      filter: (
        <ChoiceList
          title="Rating"
          titleHidden
          choices={ratingFilterOptions}
          selected={selectedRatings}
          onChange={handleRatingFilterChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: "dateRange",
      label: "Date Range",
      filter: (
        <BlockStack gap="2">
          <TextField
            label="From"
            type="date"
            value={dateRange.start}
            onChange={(value) => setDateRange({ ...dateRange, start: value })}
          />
          <TextField
            label="To"
            type="date"
            value={dateRange.end}
            onChange={(value) => setDateRange({ ...dateRange, end: value })}
          />
        </BlockStack>
      ),
    },
  ]

  const appliedFilters = []
  if (selectedRatings.length > 0) {
    const ratingLabels = selectedRatings.map((rating) => {
      const option = ratingFilterOptions.find((option) => option.value === rating)
      return option ? option.label : rating
    })
    appliedFilters.push({
      key: "rating",
      label: `Rating: ${ratingLabels.join(", ")}`,
      onRemove: () => setSelectedRatings([]),
    })
  }

  if (dateRange.start || dateRange.end) {
    appliedFilters.push({
      key: "dateRange",
      label: `Date: ${dateRange.start || "Any"} - ${dateRange.end || "Any"}`,
      onRemove: () => setDateRange({ start: "", end: "" }),
    })
  }

  const rows = sortedResponses.map((response, index) => [
    response.customer,
    response.email,
    response.date,
    <Badge key={index} tone={getRatingTone(response.rating)}>
      {response.rating} Stars
    </Badge>,
    <Button key={index} size="slim" icon={ViewIcon} onClick={() => handleViewResponse(response.id)}>
      View
    </Button>,
  ])

  function getRatingTone(rating) {
    if (rating >= 4) return "success"
    if (rating === 3) return "warning"
    return "critical"
  }

  return (
    <Page fullWidth>
      <LegacyTabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
        <BlockStack gap="4">
          {selectedTab === 0 ? (
            <BlockStack gap="4">
              <Card>
                <BlockStack gap="4">
                  <InlineStack align="space-between">
                    <Text variant="headingMd" as="h2">
                      Survey Responses
                    </Text>
                    <Button icon={ExportIcon}>Export</Button>
                  </InlineStack>

                  <Filters
                    queryValue={queryValue}
                    queryPlaceholder="Search by customer name or email"
                    filters={filters}
                    appliedFilters={appliedFilters}
                    onQueryChange={handleFiltersQueryChange}
                    onQueryClear={() => setQueryValue("")}
                    onClearAll={handleClearFilters}
                  />

                  {filteredResponses.length === 0 ? (
                    <EmptySearchResult
                      title="No responses found"
                      description="Try changing the filters or search term"
                      withIllustration
                    />
                  ) : (
                    <DataTable
                      columnContentTypes={["text", "text", "text", "text", "text"]}
                      headings={["Customer", "Email", "Date", "Rating", "Actions"]}
                      rows={rows}
                      sortable={[true, true, true, true, false]}
                      defaultSortDirection="asc"
                      initialSortColumnIndex={sortedColumn}
                      onSort={handleSort}
                      footerContent={`Showing ${filteredResponses.length} of ${responses.length} responses`}
                    />
                  )}
                </BlockStack>
              </Card>

              <LegacyCard title="Response Summary" sectioned>
                <BlockStack gap="4">
                  <InlineStack gap="4" wrap={false}>
                    <Card>
                      <BlockStack gap="2" align="center">
                        <Text variant="headingXl" as="p">
                          {responses.length}
                        </Text>
                        <Text variant="bodySm" as="p">
                          Total Responses
                        </Text>
                      </BlockStack>
                    </Card>

                    <Card>
                      <BlockStack gap="2" align="center">
                        <Text variant="headingXl" as="p">
                          {(responses.reduce((sum, r) => sum + r.rating, 0) / responses.length).toFixed(1)}
                        </Text>
                        <Text variant="bodySm" as="p">
                          Average Rating
                        </Text>
                      </BlockStack>
                    </Card>

                    <Card>
                      <BlockStack gap="2" align="center">
                        <Text variant="headingXl" as="p">
                          {responses.filter((r) => r.rating >= 4).length}
                        </Text>
                        <Text variant="bodySm" as="p">
                          Satisfied Customers
                        </Text>
                      </BlockStack>
                    </Card>
                  </InlineStack>
                </BlockStack>
              </LegacyCard>
            </BlockStack>
          ) : (
            <SurveyAnalytics responses={responses} />
          )}
        </BlockStack>
      </LegacyTabs>

      <Modal
        open={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        title="Survey Response Details"
        primaryAction={{
          content: "Close",
          onAction: () => setShowResponseModal(false),
        }}
      >
        <Modal.Section>
          {selectedResponse && (
            <BlockStack gap="4">
              <InlineStack gap="2">
                <Text variant="bodyMd" as="span" fontWeight="bold">
                  Customer:
                </Text>
                <Text variant="bodyMd" as="span">
                  {selectedResponse.customer}
                </Text>
              </InlineStack>

              <InlineStack gap="2">
                <Text variant="bodyMd" as="span" fontWeight="bold">
                  Email:
                </Text>
                <Text variant="bodyMd" as="span">
                  {selectedResponse.email}
                </Text>
              </InlineStack>

              <InlineStack gap="2">
                <Text variant="bodyMd" as="span" fontWeight="bold">
                  Date:
                </Text>
                <Text variant="bodyMd" as="span">
                  {selectedResponse.date}
                </Text>
              </InlineStack>

              <InlineStack gap="2">
                <Text variant="bodyMd" as="span" fontWeight="bold">
                  Rating:
                </Text>
                <Badge tone={getRatingTone(selectedResponse.rating)}>{selectedResponse.rating} Stars</Badge>
              </InlineStack>

              <BlockStack gap="2">
                <Text variant="bodyMd" as="p" fontWeight="bold">
                  Responses:
                </Text>
                <Card>
                  <BlockStack gap="4">
                    <InlineStack gap="2">
                      <Text variant="bodyMd" as="span" fontWeight="bold">
                        How would you rate our product?
                      </Text>
                      <Text variant="bodyMd" as="span">
                        {selectedResponse.rating} Stars
                      </Text>
                    </InlineStack>

                    <InlineStack gap="2">
                      <Text variant="bodyMd" as="span" fontWeight="bold">
                        What features do you like most?
                      </Text>
                      <Text variant="bodyMd" as="span">
                        {["Quality", "Design"][Math.floor(Math.random() * 2)]}
                      </Text>
                    </InlineStack>

                    <InlineStack gap="2">
                      <Text variant="bodyMd" as="span" fontWeight="bold">
                        Any additional feedback?
                      </Text>
                      <Text variant="bodyMd" as="span">
                        {selectedResponse.rating >= 4
                          ? "Great product, very satisfied!"
                          : "Could use some improvements."}
                      </Text>
                    </InlineStack>
                  </BlockStack>
                </Card>
              </BlockStack>
            </BlockStack>
          )}
        </Modal.Section>
      </Modal>
    </Page>
  )
}

