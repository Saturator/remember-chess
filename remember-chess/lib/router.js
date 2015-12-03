Router.configure({
    layoutTemplate: 'layout'
});

Router.route('/', {name: 'intro'})

Router.route('/train', {name: 'mainApp'})