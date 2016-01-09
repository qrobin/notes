/**
 * Created by kriz on 08/01/16.
 */

Meteor.publish('partitions', function () {
    return Partitions.find();
});

Meteor.publish('partitionContent', function (partId) {
    return [
        Sections.find({ partition: partId }),
        Chapters.find({ partition: partId })
    ];
});