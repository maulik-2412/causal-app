# Instructions for development

It is a shopify app used for injecting survey into Cart and then store the responses, it has template ready for analytics and responses. I have used dummy data for analytics, you can change it as per your requirement. There are some things can only used stored when it is live, like user name, email etc. So I have left them empty.

## Getting started

### Requirements

1. You must [download and install Node.js](https://nodejs.org/en/download/) if you don't already have it.
1. You must [create a Shopify partner account](https://partners.shopify.com/signup) if you don’t have one.
1. You must create a store for testing if you don't have one, either a [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or a [Shopify Plus sandbox store](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store).

### Installing app

Clone the repo.

Then download all necessary packages.
There are four different locations you have to install packages.

1. Root folder

```bash
/
```

2. Web folder-backend, which is created using Node.js and Express.js is here.
```bash
/web/
```
3. frontend folder-Here is the frontend where Admin UI can be designed. 
 ```bash
/web/frontend
```
4. extensionUI folder-Here is frontend for Theme Extension
```bash
/extensionUI
```

#### Local Development

[The Shopify CLI](https://shopify.dev/docs/apps/tools/cli) connects to an app in your Partners dashboard. It provides environment variables, runs commands in parallel, and updates application URLs for easier development.

You can develop locally using your preferred package manager. Run one of the following commands from the root of your app.

Using yarn:

```shell
yarn dev
```

Using npm:

```shell
npm run dev
```

Using pnpm:

```shell
pnpm run dev
```

Open the URL generated in your console. Once you grant permission to the app, you can start development.

## Deployment

### Application Storage

I have used MongoDB for storage. For session storage, edit your choice of database in /web/shopify.js

The database that works best for you depends on the data your app needs and how it is queried.                                                                                                |

For Admin UI, use web/frontend.
In /pages, you have index.jsx, which directly show changes in admin panel of your app.

For Theme extension, use extensionUI.
After building, use 
```bash
npm run build
```
to build it, and then import created index.js inside dist/ to extension/assets.
This is required as Theme extension doesn't support React.js.

For backend, 
use routes used by Theme Extension frontend above authentication, as then it will cause error. I'm looking to add API key security to keep it safe., for now, i is open.

Use App Proxy in your App dashboard to join your Theme Extension and backend. 
I have used ngrok for tunneling as cloudfare was getting shut down repatedly.
For nrgok,
```bash
ngrok http PORTNUMBER
```
then use the created link while using 
```bash
/npm run dev -- --tunnel-url NGROK_LINK
```

## Usage

App is simple to use, 
install it on shop, then use theme editor, to drag the theme extension survey box, to where you want it.
Use admin panel for editing Survey Questions.
For analytics, go to Survey Analytics page, I have used dummy data for now, but you can make changes to it.
I'm looking to add more changes like-
1. Change Schema to better suit analytics page.
2. Add compulsary question for easy rating and analysis.
3. Date filtering system.

Otherwise app is good to go.

## Developer resources

- [Introduction to Shopify apps](https://shopify.dev/docs/apps/getting-started)
- [App authentication](https://shopify.dev/docs/apps/auth)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [Shopify API Library documentation](https://github.com/Shopify/shopify-api-js#readme)
- [Getting started with internationalizing your app](https://shopify.dev/docs/apps/best-practices/internationalization/getting-started)
  - [i18next](https://www.i18next.com/)
    - [Configuration options](https://www.i18next.com/overview/configuration-options)
  - [react-i18next](https://react.i18next.com/)
    - [`useTranslation` hook](https://react.i18next.com/latest/usetranslation-hook)
    - [`Trans` component usage with components array](https://react.i18next.com/latest/trans-component#alternative-usage-components-array)
  - [i18n-ally VS Code extension](https://marketplace.visualstudio.com/items?itemName=Lokalise.i18n-ally)
