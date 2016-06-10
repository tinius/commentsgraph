import _ from 'lodash'
import moment from 'moment'
import rp from 'request-promise'
import Bottleneck from 'bottleneck'

var limiter = new Bottleneck(1, 100);

function encodeParams(params) {
    return _(params).mapValues(encodeURIComponent).map((v, k) => `${k}=${v}`).join('&');
}

const contentUrl = 'http://content.guardianapis.com/search'
const contentParams = encodeParams({
    'tag': process.argv[2],
    'from-date': moment().subtract(7, 'days').format('YYYY-MM-DD'),
    'page-size': 100,
    'api-key': 'gnm-hackday-2016',
    'show-fields': 'shortUrl'
});

const discussionUrl = 'http://discussion.theguardian.com/discussion-api/discussion/';
const discussionParams = encodeParams({
    'pageSize': 100
});


function getContent(page=1) {
    var uri = `${contentUrl}?${contentParams}&page=${page}`;
    return limiter.schedule(rp, {uri, 'json': true}).then(data => {
        console.error(uri);
        var results = data.response.results;
        if (page < data.response.pages) {
            return getContent(page + 1).then(nextResults => results.concat(nextResults));
        } else {
            return Promise.resolve(results);
        }
    });
}

function getComments(shortUrl, page=1) {
    var uri = `${discussionUrl}${shortUrl}?${discussionParams}&page=${page}`;
    return limiter.schedule(rp, {uri, 'json': true}).then(data => {
        console.error(uri);
        var comments = data.discussion.comments;
        if (page < data.pages) {
            return getComments(shortUrl, page + 1).then(nextComments => comments.concat(nextComments));
        } else {
            return Promise.resolve(comments);
        }
    }).catch(err => {
        return Promise.resolve([]);
    });
}

getContent().then(articles => {
    console.error(`${articles.length} articles`);
    var promises = articles.map(article => {
        var shortUrl = article.fields.shortUrl.replace('http://gu.com/', '');
        return getComments(shortUrl).then(comments => { return {article, comments}});
    });

    return Promise.all(promises);
}).then(results => {
    console.log(JSON.stringify(results));
}).catch(err => {
    console.error(err);
});

/*getComments('p/4hp57').then(comments => {
    var results = [{'article': {}, comments}];
    console.log(JSON.stringify(results));
}).catch(err => {
    console.error(err);
});*/
