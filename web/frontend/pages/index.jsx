import { useState } from "react";
import {
  Card,
  Page,
  Layout,
  AppProvider,
  Tabs,
  Frame,
  TopBar,
  Navigation,
  SkeletonPage,
  Box
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";
import SurveyCreator from "../components/SurveyCreator"
import SurveyResults from "../components/SurveyResults"
import "@shopify/polaris/build/esm/styles.css"
import { HomeFilledIcon, QuestionCircleIcon, ChartVerticalFilledIcon, SettingsFilledIcon } from "@shopify/polaris-icons"

export default function HomePage() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(0)
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleTabChange = (selectedTabIndex) => setSelected(selectedTabIndex)


  const tabs = [
    {
      id: "create-survey",
      content: "Create Survey",
      accessibilityLabel: "Create and manage surveys",
      panelID: "create-survey-panel",
    },
    {
      id: "survey-results",
      content: "Survey Results",
      accessibilityLabel: "View survey results and analytics",
      panelID: "survey-results-panel",
    },
  ]





  const topBarMarkup = (
    <TopBar
    />
  )

  

  const loadingMarkup = (
    <SkeletonPage primaryAction>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <div style={{ height: "200px" }} />
          </Card>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  )

  const actualPageMarkup = (
    <Page title="Survey Management">
      <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
        <Card>{selected === 0 ? <SurveyCreator /> : <SurveyResults />}</Card>
      </Tabs>
    </Page>
  )

  const pageMarkup = isLoading ? loadingMarkup : actualPageMarkup
  return (
    <>
      <TitleBar title={t("HomePage.title")} />
      
        <Frame topBar={topBarMarkup}>
          {pageMarkup}
        </Frame>
        </>
    
  );
}
