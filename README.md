GitHub Activity
==============

A customizable jQuery plugin to display your latest GitHub activity.


### Getting started

1.  Include jQuery & github-activity on your page before the closing ``</body>`` tag

    ```html
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script>
    <script src="/path/to/github-activity.js"></script>
    ```

2.  Attach the plugin to a ``<ul>`` element on DOM ready. Remember to pass in your username.

    ```javascript
    $(function() {
      $('ul#github-activity').GitHubActivity({username: 'damianmullins'});
    });
    ```
