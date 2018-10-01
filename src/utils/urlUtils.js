function queryStringToJSON(searchQuery) {
    if (!searchQuery || searchQuery === '') {
        return {};
    }
    
    var pairs = searchQuery.slice(1).split('&');

    var result = {};
    pairs.forEach(function(pair) {
        pair = pair.split('=');
        result[pair[0]] = decodeURIComponent(pair[1] || '');
    });

    return JSON.parse(JSON.stringify(result));
}
export default {
    queryStringToJSON
};
