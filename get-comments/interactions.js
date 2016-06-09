import rw from 'rw'
import _ from 'lodash'

var results = JSON.parse(rw.readFileSync('/dev/stdin'));

var interactions = _(results)
    .flatMap(result => result.comments)
    .flatMap(comment => {
        return (comment.responses || []).map(response => { 
            return {'source': comment.userProfile.userId, 'replier': response.userProfile.userId}
        });
    })
    .filter(interaction => interaction.source !== interaction.replier)
    .valueOf();

var users = _(interactions)
    .flatMap(interaction => [interaction.source, interaction.replier])
    .uniq()
    .valueOf();

var vertices = users.map(user => { return {user}; });
var edges = _(interactions)
    .groupBy(interaction => [interaction.source, interaction.replier].sort().join('-'))
    .map(userInteractions => {
        var source = users.indexOf(userInteractions[0].source);
        var target = users.indexOf(userInteractions[0].replier);
        var value = userInteractions.length;
        return {source, target, value};
    })
    .valueOf();

console.log(JSON.stringify({vertices, edges}));
