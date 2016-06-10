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
                'source': comment.userProfile.userId,
                'replier': response.userProfile.userId,
                'timestamp': response.isoDateTime,
                'blocked': response.status === 'blocked'
            };
        });
    })
    .filter(interaction => interaction.source !== interaction.replier)
    .sortBy('timestamp')
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
        .groupBy(interaction => [interaction.source, interaction.replier].sort().join('-'))
        .map(userInteractions => {
            var source = getUser(userInteractions[0].source);
            var target = getUser(userInteractions[0].replier);
            return {source, target, 'value': userInteractions.length};
        })
        .valueOf();

    var newUsers = _.difference(users, existingUsers);
    var vertices = newUsers.map(user => { return {user}; });

    console.error(start.format(), vertices.length, edges.length);

    return {'start': start.format(), vertices, edges};
});

console.log(JSON.stringify(out));
