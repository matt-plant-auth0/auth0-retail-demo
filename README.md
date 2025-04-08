## Auth0 Retail Demo

Built using Jamstack ECommerce Next template - a fully configurable ECommerce site using Next.js.

### Live preview

Click [here](https://auth0-retail-demo.vercel.app/) to see a live preview.

### Getting started

1. Clone the project

```sh
$ git clone https://github.com/matt-plant-auth0/auth0-retail-demo.git
```

2. Install the dependencies:

```sh
$ yarn

# or

$ npm install
```

3. Run the project

```sh
$ npm run dev

# or to build

$ npm run build
```

## About the project

### Tailwind

This project is styled using Tailwind. To learn more how this works, check out the Tailwind documentation [here](https://tailwindcss.com/docs).

### Components

The main files, components, and images you may want to change / modify are:

__Logo__ - public/logo.png   
__Button, ListItem, etc..__ - components   
__Form components__ - components/formComponents   
__Context (state)__ - context/mainContext.js   
__Pages (admin, cart, checkout, index)__ - pages   
__Templates (category view, single item view, inventory views)__ - templates   

### How it works

As it is set up, inventory is fetched from a local hard coded array of inventory items. This can easily be configured to instead be fetched from a remote source like Shopify or another CMS or data source by changing the inventory provider.

#### Configuring inventory provider

The inventory is pulled from a static JSON file in a specific format, an example of which is in the repo. In the example deployment this is hosted in an S3 bucket.
