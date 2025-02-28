import { useEffect, useRef, useState } from "react"
import { Card, Layout, Text, BlockStack, InlineStack, Select  } from "@shopify/polaris"
import { Chart } from "chart.js/auto"

export default function SurveyAnalytics({ responses }) {
  const ratingChartRef = useRef(null)
  const timeChartRef = useRef(null)
  
  const [timeRange, setTimeRange] = useState("week")
  const ratingChartInstance = useRef(null)
  const timeChartInstance = useRef(null)
  

  useEffect(() => {
    // Clean up previous charts
    if (ratingChartInstance.current) {
        ratingChartInstance.current.destroy()
      }
      if (timeChartInstance.current) {
        timeChartInstance.current.destroy()
      }
      

    if (!responses.length) return; 

    // Create rating distribution chart
    if (ratingChartRef.current) {
      const ratingCounts = [0, 0, 0, 0, 0] // 1-5 stars
      responses.forEach((response) => {
        ratingCounts[response.rating - 1]++
      })

      ratingChartInstance.current = new Chart(ratingChartRef.current, {
        type: "bar",
        data: {
          labels: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
          datasets: [
            {
              label: "Number of Responses",
              data: ratingCounts,
              backgroundColor: [
                "#F87171", // red for 1 star
                "#FBBF24", // amber for 2 stars
                "#FCD34D", // yellow for 3 stars
                "#34D399", // green for 4 stars
                "#10B981", // emerald for 5 stars
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: "Rating Distribution",
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
              },
            },
          },
        },
      })
      
    }

    // Create time-based chart
    if (timeChartRef.current) {
      // Sort responses by date
      const sortedResponses = [...responses].sort((a, b) => new Date(a.date) - new Date(b.date))

      // Group by date and calculate average rating
      const dateMap = new Map()
      sortedResponses.forEach((response) => {
        const date = response.date
        if (!dateMap.has(date)) {
          dateMap.set(date, { total: 0, count: 0 })
        }
        const data = dateMap.get(date)
        data.total += response.rating
        data.count += 1
      })

      const dates = Array.from(dateMap.keys())
      const averageRatings = dates.map((date) => {
        const data = dateMap.get(date)
        return data.total / data.count
      })

      timeChartInstance.current = new Chart(timeChartRef.current, {
        type: "line",
        data: {
          labels: dates,
          datasets: [
            {
              label: "Average Rating",
              data: averageRatings,
              borderColor: "#6366F1",
              backgroundColor: "rgba(99, 102, 241, 0.2)",
              tension: 0.1,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Rating Trend Over Time",
            },
          },
          scales: {
            y: {
              min: 0,
              max: 5,
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      })
      
    }

    // Create question performance chart
    

    return () => {
        if (ratingChartInstance.current) ratingChartInstance.current.destroy()
        if (timeChartInstance.current) timeChartInstance.current.destroy()
        
      }
    }, [responses])

  const timeRangeOptions = [
    { label: "Last 7 days", value: "week" },
    { label: "Last 30 days", value: "month" },
    { label: "Last 90 days", value: "quarter" },
    { label: "Last year", value: "year" },
    { label: "All time", value: "all" },
  ]

  return (
    <BlockStack gap="4">
      <Card>
        <BlockStack gap="4">
          <Text variant="headingMd" as="h2">
            Survey Analytics
          </Text>
          <Text variant="bodyMd" as="p">
            Gain insights from your survey responses with these analytics.
          </Text>
        </BlockStack>
      </Card>

      <Layout>
        <Layout.Section oneHalf>
          <Card title="Rating Distribution" sectioned>
            <canvas ref={ratingChartRef} height="250" />
          </Card>
        </Layout.Section>

        
      </Layout>

      <Card sectioned>
        <BlockStack gap="4">
          <InlineStack align="space-between">
            <Text variant="headingMd" as="h3">
              Rating Trend Over Time
            </Text>
            <div style={{ width: "200px" }}>
              <Select
                label="Time Range"
                labelHidden
                options={timeRangeOptions}
                value={timeRange}
                onChange={setTimeRange}
              />
            </div>
          </InlineStack>
          <canvas ref={timeChartRef} height="250" />
        </BlockStack>
      </Card>

      <Layout>
        <Layout.Section oneThird>
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
        </Layout.Section>

        <Layout.Section oneThird>
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
        </Layout.Section>

        <Layout.Section oneThird>
          <Card>
            <BlockStack gap="2" align="center">
              <Text variant="headingXl" as="p">
                {Math.round((responses.filter((r) => r.rating >= 4).length / responses.length) * 100)}%
              </Text>
              <Text variant="bodySm" as="p">
                Satisfaction Rate
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </BlockStack>
  )
}

