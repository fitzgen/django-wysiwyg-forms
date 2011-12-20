# Transactions

## Initial Design and Rational

Django WYSIWYG Forms communicates between the client and server with
transactions. As a user is editing a form, the client side JS is recording an
ordered series of transactions. Transactions would be JSON that might look like
this:

    { action: "move field",
      field: "Email address",
      to: 4 }

or

    { action: "rename field",
      field: "Email address",
      to: "Email" }

When the user hits a save button, these transactions are sent to the server
which interprets and applies these transactions in order to the form model
instance in question. Then the server sends back *it's* updated "master"
representation of the form to the client (which might include someone else's
parallel edits). The client takes what the server sends it and completely
re-renders as if starting from scratch. Conflicts won't be considered at this
point of the project, (that would be moving towards the realm of Operational Transformation).

Benefits, as I see them:

 * Easy to unit test (both on client and server) since transactions are formal,
   small, and atomic.

 * Interpretation of transactions on the server side breaks the problem in to
   smaller, easier pieces.

 * JavaScript/DOM's event based nature makes it easy to generate atomic
   transactions. We don't need to maintain any state on the client side other
   than the list of transactions, which is a big win in simplifying the client
   side code.

 * Although this is not a concern at this stage in the project: Better parallel
   editing than syncing server verbatim from whatever the client has.

## The Transaction Language

### Change Name

    action: "change name"
    to: The new name

### Change Description

    action: "change description"
    to: The new description

### Add Field

By default, new fields are initialized to CharFields and help_text is "". To
change them requires a separate transaction, so this one doesn't need to know
anything about that.

    action: "add field"
    label: The new field's label

### Remove Field

    action: "remove field"
    label: A field's label

### Rename Field

    action: "rename field"
    label: The old label
    to: The new label

### Change Help Text

    action: "change help text"
    label: the field's label
    to: The new help_text

### Move Field

    action: "move field"
    label: the field's label
    to: The 0-based index of the new position

### Change Field Type

    action: "change field type"
    label: the field's label
    to: The new field type

### Change Field Widget

    action: "change field widget
    label: the field's label
    to: The new widget

### Change Field Required

    action: "change field required"
    label: the field's label
    to: true if the field is a required field, false otherwise

### Add Choice

The following choice-related transactions should validate that the field
actually accepts choices.

    action: "add choice"
    label: the field's label
    choice_label: The new choice's label

### Remove Choice

    action: "remove choice"
    label: the field's label
    choice_label: the label of the to-be-deleted choice

### Change Choice

    action: "change choice"
    label: the field's label
    choice_label: the choice's old label
    to: The choice's new label

### Move Choice

    action: "move choice"
    label: the field's label
    choice_label: the choice's label
    to: the 0-indexed new position of the choice
