import rw from 'rw'
import _ from 'lodash'
import moment from 'moment'
import 'moment-range'

var results = JSON.parse(rw.readFileSync('/dev/stdin'));

var interactions = _(results)
    .flatMap(result => result.comments)
    .flatMap(comment => {
        return (comment.responses || []).map(response => {
            return {
                'source': response.userProfile.userId,
                'replyTo': comment.userProfile.userId,
                'timestamp': response.isoDateTime,
                'blocked': response.status === 'blocked'
            };
        }).concat({
            'source': comment.userProfile.userId,
            'timestamp': comment.isoDateTime,
            'blocked': comment.status === 'blocked'
        });
    })
    .filter(interaction => interaction.source !== interaction.replyTo)
    .sortBy('timestamp')
    .valueOf();

var blocks = _(interactions)
    .groupBy('source')
    .mapValues(user => _.some(user, 'blocked'))
    .valueOf();

var users = [];
function getUser(user) {
    if (users.indexOf(user) === -1) users.push(user);
    return users.indexOf(user);
}

var start = moment(_.first(interactions).timestamp);
var end = moment(_.last(interactions).timestamp);
var step = Math.floor(moment.duration(end.diff(start)).asSeconds() / 300);

var dates = [];
while (start.isBefore(end)) {
    dates.push(start);
    start = start.clone().add(step, 'seconds');
};

var out = dates.map(start => {
    var end = start.clone().add(step, 'seconds');
    var range = moment.range(start, end);

    var existingUsers = users.slice();

    var edges = _(interactions)
        .filter(interaction => range.contains(moment(interaction.timestamp), false))
        .groupBy(interaction => [interaction.source, interaction.replyTo].sort().join('-'))
        .map(userInteractions => {
            var source = getUser(userInteractions[0].source);
            if (userInteractions[0].replyTo) {
                var target = getUser(userInteractions[0].replyTo);
                return {
                    source,
                    target,
                    'value': userInteractions.length,
                    'blocked': _.some(userInteractions, 'blocked')
                };
            }
        })
        .filter(edge => edge)
        .valueOf();

    var newUsers = _.difference(users, existingUsers);
    var vertices = newUsers.map(user => { return {user, 'blocked': blocks[user]}; });

    console.error(start.format(), vertices.length, edges.length);

    return {'start': start.format(), vertices, edges};
});

console.log(JSON.stringify(out));
