/**
 * Github activity feed
 * Damian Mullins, August 2013
 */

;(function ($, window, document, undefined) {
    "use strict";
    
    $.fn.GitHubActivity = function (options) {
        var settings = $.extend({}, $.fn.GitHubActivity.defaults, options),
            activity = {};
        
        function repositoryAnchor(withPrefix) {
            var repo = activity.repository,
                anchorText = (withPrefix === true ? repo.owner + '/' : '') + repo.name;
            return $('<a/>', {href: repo.url, text: anchorText});
        }
        
        function friendlyDate() {
            var commitDate = activity.repository.pushed_at,
                jsDate = new Date(commitDate);
            
            if (settings.enableMomentDates) {
                return $('<time/>', {datetime: commitDate, title: commitDate, text: moment(jsDate).fromNow()});
            }
            return jsDate.toDateString();
        }
        
        function create() {
            switch (activity.payload.ref_type) {
            case 'repository':
                return $('<li/>')
                    .append('Created repository ')
                    .append(repositoryAnchor())
                    .append(' - ')
                    .append(friendlyDate());
            case 'branch':
                var branchAnchor = $('<a/>', {href: activity.repository.url + '/tree/' + activity.payload.ref, text: activity.payload.ref});
                return $('<li/>')
                    .append('Created branch ')
                    .append(branchAnchor)
                    .append(' at ')
                    .append(repositoryAnchor(true))
                    .append(' - ')
                    .append(friendlyDate());
            }
        }
    
        function push() {
            var ref = activity.payload.ref,
                branch = ref.substring(ref.lastIndexOf('/') + 1, ref.length),
                branchAnchor = $('<a/>', {href: activity.repository.url + '/tree/' + branch, text: branch}),
                payloadAnchor = '',
                ul = $('<ul/>');
                    
            $.each(activity.payload.shas, function (i, sha) {
                var shortSha = sha[0].substring(0, 6),
                    shaAnchor = $('<a/>', {href: activity.repository.url + '/commit/' + sha[0], text: shortSha}),
                    li = $('<li/>').append(shaAnchor)
                        .append(' ')
                        .append(sha[2])
                        .append('.');
                
                ul.append(li);
            });
            
            if (settings.showPushComparisonLinks) {
                payloadAnchor = $('<a/>', {href: activity.url, text: 'View comparison for these ' + activity.payload.shas.length + ' commits'});
                ul.append($('<li/>').append(payloadAnchor));
            }
                
            return $('<li/>')
                .append('Pushed to ')
                .append(branchAnchor)
                .append(' at ')
                .append(repositoryAnchor(true))
                .append(' - ')
                .append(friendlyDate())
                .append(ul);
        }
        
        function watch() {
            return $('<li/>')
                .append('Watched ')
                .append(repositoryAnchor());
        }
        
        function gist() {
            var gistAnchor = $('<a/>', {href: activity.payload.url, text: activity.payload.desc});
            return $('<li/>')
                .append(activity.payload.action + 'd gist:')
                .append(gistAnchor)
                .append('.');
        }
        
        function template() {
            switch (activity.type) {
            case "CreateEvent":
                if (settings.showCreateEvents) {
                    return create();
                }
                break;
            case "PushEvent":
                if (settings.showPushEvents) {
                    return push();
                }
                break;
            case "WatchEvent":
                if (settings.showWatchEvents) {
                    return watch();
                }
                break;
            case "GistEvent":
                if (settings.showGistEvents) {
                    return gist();
                }
                break;
            }
        }
        
        return this.each(function () {
            var self = $(this),
                url = 'https://github.com/' + settings.username + '.json?callback=?',
                limit = settings.items || 10;
            
            $.getJSON(url, {}, function (data) {
                $.each(data.slice(0, limit), function (index, commit) {
                    activity = commit;
                    self.append(template());
                });
            });
        });
    };
    
    $.fn.GitHubActivity.defaults = {
        username: '',
        items: 10,
        enableMomentDates: false,
        showPushComparisonLinks: true,
        showCreateEvents: true,
        showPushEvents: true,
        showWatchEvents: true,
        showGistEvents: true
    };
}(jQuery, window, document));
