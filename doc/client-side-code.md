# Client Side Code

## Overview

The JavaScript on the client side uses jQuery, require.js, and a gentlemen's
agreement of a framework which is really just a set of interfaces.

## Layout

All of the JavaScript resides in `media/wysiwyg_forms/js`. This includes third party code,
such as require.js. All code specific to this project resides within
`media/wysiwyg_forms/js/dwf` and is tied together in `media/wysiwyg_forms/js/dwf.js`. `dwf` stands for
Django WYSIWYG Forms, and is used as a namespace in a few different places.

* `media/wysiwyg_forms/js/dwf/views/` - This is where the actual interaction
  with the code for the interaction with the DOM is kept. There are also `.html`
  files here which serve as static templates for the different views. A base
  class lives in `media/wysiwyg_forms/js/dwf/views/base-view.js` which all other
  views inherit from. Studying the base view should give you a fairly good idea
  of the life cycle of a view (activate -> addListeners -> removeListeners ->
  deactivate) as well as what the base view will give you out of the
  box. Generally, views translate between DOM events or user actions to events
  or actions that are semantic within the application. For example, translating
  the clicking of a specific button in the DOM to the idea that the application
  should add a new field to the form.

* `media/wysiwyg_forms/js/dwf/models/` - This is where objects reside that manage and
  represent the actual data being manipulated by the app. These objects handle
  the creation of transactions which eventually get sent serverside with
  `media/wysiwyg_forms/js/dwf/transactions.js`. There is no base model, the
  models just try and do as much encapsulation as possible and hide the
  implemenation while showing semantic actions. If that makes sense.

* `media/wysiwyg_forms/js/dwf/utils` - Utility functions used all over the place.

* `media/wysiwyg_forms/js/dwf/transactions` - Handles the communication with the
  server-side. [Read more here](./transactions.md).

* `media/wysiwyg_forms/js/dwf.js` - Ties the views and models together, as well
  as initializes the app, and just does general plumbing between modules. This
  is what you might consider the controller in the traditional MVC style.
