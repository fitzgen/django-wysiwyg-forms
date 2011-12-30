(function () {

    var iframe = document.createElement('iframe');
    iframe.src = document.getElementById('iframe-src').textContent;
    iframe.style.width = '100%';
    iframe.style.height = '400px';

    iframe.addEventListener('load', function () {

        var testDoc = iframe.contentDocument;
        var testWindow = iframe.contentWindow;

        var $ = testWindow.jQuery;
        var require = testWindow.require;

        require(['dwf/transactions', 'dwf/util'], function (transactions, util) {

            // Shim util.prompt since we cannot programmatically fill out prompt
            // windows.
            var promptCb = null;
            util.prompt = function (msg, callback) {
                promptCb = callback;
            };
            function fillPrompt(val) {
                promptCb(val);
            }


            // Allow us to check and test what transactions are being sent over
            // the network.

            // A list of all the transactions sent in this test.
            var transactionsSent = [];

            // Assert that the transaction txn was sent (possibly one of many
            // transactions sent).
            function assertTransaction(txn) {
                outer: for ( var i = 0, len = transactionsSent.length; i < len; i++ ) {
                    for ( var k in txn ) {
                        if ( txn.hasOwnProperty(k) && transactionsSent[i][k] !== txn[k] ) {
                            continue outer;
                        }
                    }
                    ok(true, 'Transaction sent: ' + JSON.stringify(txn));
                    return;
                }
                ok(false, 'Could not find transaction ' + JSON.stringify(txn)
                   + ' in ' + JSON.stringify(transactionsSent));
            }

            // Listen to the stuff being sent over the network and parse out the
            // transactions.
            $(testDoc).ajaxSend(function (event, xhr, options) {
                var bits = options.data.split('&');
                var params = {};
                for ( var i = 0, len = bits.length; i < len; i++ ) {
                    bits[i] = bits[i].split('=');
                    params[bits[i][0]] = decodeURIComponent(bits[i][1]).replace(/\+/g, ' ');
                }

                transactionsSent.push.apply(transactionsSent, JSON.parse(params.transactions));
            });

            // A little DSL for our async tests which automatically forces
            // transactions to be sent over the wire so we can inspect them for
            // our test.
            function then(fn) {
                setTimeout(function () {
                    transactions.saveNow();
                    fn();
                    start();
                }, 12);
            }


            // The actual tests.

            module('form', {
                setup: function () {
                    $('.form-settings').click();
                    stop();
                    setTimeout(function () {
                        transactions.saveNow();
                        transactionsSent = [];
                        start();
                    }, 12);
                },
                teardown: function () {
                    $('.DWF-field .DWF-delete').click();
                    stop();
                    setTimeout(function () {
                        start();
                    }, 12);
                }
            });

            asyncTest('changing form name', function () {
                $('#DWF-form-settings-name')
                    .val('TEST')
                    .keyup();
                then(function () {
                    assertTransaction({
                        action: 'change name',
                        to: 'TEST'
                    });
                    equal('TEST', $('#DWF-form-name').text());
                });
            });

            asyncTest('changing form description', function () {
                $('#DWF-form-settings-description')
                    .val('TEST')
                    .keyup();
                then(function () {
                    assertTransaction({
                        action: 'change description',
                        to: 'TEST'
                    });
                    equal('TEST', $('#DWF-form-description').text());
                });
            });

            asyncTest('adding a field', function () {
                $('.add-field').click();
                setTimeout(function () {
                    $('#DWF-add-field li button:first').click();
                    fillPrompt('Test field');
                    then(function () {
                        equal(1, $('.DWF-field').length);
                        assertTransaction({
                            action: 'add field',
                            label: 'Test field'
                        });
                    }, 12);
                }, 12);
            });


            module('fields', {
                setup: function () {
                    stop();
                    $('.add-field').click();
                    setTimeout(function () {
                        $('#DWF-add-field li button:first').click();
                        fillPrompt('Test field');
                        $('.DWF-field:first').click();
                        setTimeout(function () {
                            transactions.saveNow();
                            transactionsSent = [];
                            start();
                        }, 12);
                    }, 12);
                },
                teardown: function () {
                    $('.DWF-field .DWF-delete').click();
                    stop();
                    setTimeout(function () {
                        start();
                    }, 12);
                }
            });

            asyncTest('changing field label', function () {
                $('#DWF-edit-field-label')
                    .val('TEST')
                    .keyup();
                then(function () {
                    equal('TEST', $('.DWF-field strong').text());
                    assertTransaction({
                        action: 'rename field',
                        label: 'Test field',
                        to: 'TEST'
                    });
                });
            });

            asyncTest('changing field help text', function () {
                $('#DWF-edit-field-help-text')
                    .val('TEST')
                    .keyup();
                then(function () {
                    equal('TEST', $('.DWF-field .DWF-help-text').text());
                    assertTransaction({
                        action: 'change help text',
                        label: 'Test field',
                        to: 'TEST'
                    });
                });
            });

            asyncTest('changing field required', function () {
                equal(1, $('.DWF-field .DWF-field-required:visible').length);
                $('#DWF-edit-field-required')
                    .removeAttr('checked')
                    .change();
                then(function () {
                    equal(0, $('.DWF-field .DWF-field-required:visible').length);
                    assertTransaction({
                        action: 'change field required',
                        label: 'Test field',
                        to: false
                    });
                });
            });

            asyncTest('changing field type', function () {
                equal(1, $('.DWF-field input[type=checkbox]').length);
                $('#DWF-edit-field-type')
                    .find(':selected').removeAttr('selected').end()
                    .find('option[value="CharField--Textarea"]').attr('selected', true).end()
                    .change();
                then(function () {
                    equal(0, $('.DWF-field input[type=checkbox]').length);
                    equal(1, $('.DWF-field textarea').length);
                    assertTransaction({
                        action: 'change field type',
                        label: 'Test field',
                        to: 'CharField'
                    });
                    assertTransaction({
                        action: 'change field widget',
                        label: 'Test field',
                        to: 'Textarea'
                    });
                });
            });


            module('choices', {
                setup: function () {
                    stop();
                    $('.add-field').click();
                    setTimeout(function () {
                        $('#DWF-add-field li button:first').click();
                        fillPrompt('Test field');
                        setTimeout(function () {
                            $('.DWF-field:first').click();
                            setTimeout(function () {
                                $('#DWF-edit-field-type option[value="ChoiceField--Select"]')
                                    .attr('selected', true);
                                $('#DWF-edit-field-type').change();
                                setTimeout(function () {
                                    transactions.saveNow();
                                    transactionsSent = [];
                                    start();
                                }, 12);
                            }, 12);
                        }, 12);
                    }, 12);
                },
                teardown: function () {
                    $('.DWF-field .DWF-delete').click();
                    stop();
                    setTimeout(function () {
                        start();
                    }, 12);
                }
            });

            asyncTest('add choice', function () {
                $('#DWF-add-choice').click();
                fillPrompt('NEW CHOICE');
                then(function () {
                    equal('NEW CHOICE', $('.DWF-field option').text());
                    assertTransaction({
                        action: 'add choice',
                        label: 'Test field',
                        choice_label: 'NEW CHOICE'
                    });
                });
            });

            asyncTest('remove choice', function () {
                $('#DWF-add-choice').click();
                fillPrompt('NEW CHOICE');
                setTimeout(function () {
                    equal('NEW CHOICE', $('.DWF-field option').text());

                    $('#DWF-edit-field-choices .DWF-delete').click();
                    then(function () {
                        equal(0, $('.DWF-field option').length);
                        assertTransaction({
                            action: 'remove choice',
                            label: 'Test field',
                            choice_label: 'NEW CHOICE'
                        });
                    });
                }, 12);
            });

            asyncTest('edit choice', function () {
                $('#DWF-add-choice').click();
                fillPrompt('NEW CHOICE');
                setTimeout(function () {
                    equal('NEW CHOICE', $('.DWF-field option').text());

                    $('#DWF-edit-field-choices input')
                        .val('OLD CHOICE')
                        .keyup();
                    then(function () {
                        equal('OLD CHOICE', $('.DWF-field option').text());
                        assertTransaction({
                            action: 'change choice',
                            label: 'Test field',
                            choice_label: 'NEW CHOICE',
                            to: 'OLD CHOICE'
                        });
                    });
                }, 12);
            });

            // asyncTest('change field type w/ choices to w/ choices', function () {
            //     then(function () {
            //         ok(false, 'TODO');
            //     });
            // });

            // asyncTest('changing field type w/choices to w/out choices)', function () {
            //     then(function () {
            //         ok(false, 'TODO');
            //     });
            // });

        });

    }, false);

    document.body.appendChild(iframe);

}());
