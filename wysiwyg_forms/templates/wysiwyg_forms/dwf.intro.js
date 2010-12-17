/*jslint browser: true, onevar: true, undef: true, eqeqeq: true, bitwise: true,
  newcap: true, immed: true, nomen: false, white: false, plusplus: false,
  laxbreak: true*/

/*global window*/

// ### Intro

var

// Our namespace.
dwf = window.dwf || {},

// Grab local copy of `undefined` which cannot be messed with if someone does
// `undefined = true` or something.
undef,

// Grab a local copy of jQuery.
$ = window.jQuery;
