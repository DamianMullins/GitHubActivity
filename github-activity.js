/**
 * Github activity feed
 * Damian Mullins, August 2013
 */

;(function ($, window, document, undefined) {
    "use strict";
    
    $.fn.GitHubActivity = function (options) {
        var settings = $.extend({}, $.fn.GitHubActivity.defaults, options);
        
        function friendlyDate(commit) {
            var commitDate = commit.repository.pushed_at,
                jsDate = new Date(commitDate);
            
            if (settings.enableMomentDates) {
                return $('<time/>', {datetime: commitDate, title: commitDate, text: moment(jsDate).fromNow()});
            }
            return jsDate.toDateString();
        }
        
        function create(commit) {
            var branchAnchor = '',
                repoAnchor = $('<a/>', {href: commit.repository.url, text: commit.repository.owner + '/' + commit.repository.name});
            
            switch (commit.payload.ref_type) {
            case "branch":
                branchAnchor = $('<a/>', {href: commit.repository.url + '/tree/' + commit.payload.ref, text: commit.payload.ref});
                return $('<li/>')
                    .append('Created branch ')
                    .append(branchAnchor)
                    .append(' at ')
                    .append(repoAnchor)
                    .append(' - ')
                    .append(friendlyDate(commit));
            }
        }
    
        function push(commit) {
            var ref = commit.payload.ref,
                branch = ref.substring(ref.lastIndexOf('/') + 1, ref.length),
                branchAnchor = $('<a/>', {href: commit.repository.url + '/tree/' + branch, text: branch}),
                repoAnchor = $('<a/>', {href: commit.repository.url, text: commit.repository.owner + '/' + commit.repository.name}),
                payloadAnchor = '',
                ul = $('<ul/>');
                    
            $.each(commit.payload.shas, function (i, sha) {
                var shortSha = sha[0].substring(0, 6),
                    shaAnchor = $('<a/>', {href: commit.repository.url + '/commit/' + sha[0], text: shortSha}),
                    li = $('<li/>').append(shaAnchor)
                        .append(' ')
                        .append(sha[2])
                        .append('.');
                
                ul.append(li);
            });
            
            if (settings.showPushComparisonLinks) {
                payloadAnchor = $('<a/>', {href: commit.url, text: 'View comparison for these ' + commit.payload.shas.length + ' commits'});
                ul.append($('<li/>').append(payloadAnchor));
            }
                
            return $('<li/>')
                .append('Pushed to ')
                .append(branchAnchor)
                .append(' at ')
                .append(repoAnchor)
                .append(' - ')
                .append(friendlyDate(commit))
                .append(ul);
        }
        
        function watch(commit) {
            var repoAnchor = $('<a/>', {href: commit.repository.url, text: commit.repository.name});
            return $('<li/>')
                .append('Watched ')
                .append(repoAnchor);
        }
        
        function gist(commit) {
            var gistAnchor = $('<a/>', {href: commit.payload.url, text: commit.payload.desc});
            return $('<li/>')
                .append(commit.payload.action + 'd gist:')
                .append(gistAnchor)
                .append('.');
        }
        
        function template(commit) {
            switch (commit.type) {
            case "CreateEvent":
                if (settings.showCreateEvents) {
                    return create(commit);
                }
                break;
            case "PushEvent":
                if (settings.showPushEvents) {
                    return push(commit);
                }
                break;
            case "WatchEvent":
                if (settings.showWatchEvents) {
                    return watch(commit);
                }
                break;
            case "GistEvent":
                if (settings.showGistEvents) {
                    return gist(commit);
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
                    self.append(template(commit));
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
