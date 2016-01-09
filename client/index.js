/**
 * Created by kriz on 08/01/16.
 */

$.fn.extend({
    htmltext() {
        return $('<textarea />').html(this.html()).text();
    }
});
/////////////////////////////////////
/////////////////////////////////////

Template.NavBar.onCreated(function () {
    this.subscribe('partitions');
});

Template.NavBar.helpers({
    partitions () {
        return Partitions.find();
    }
});

Template.NavBar.events({
    'click #add-partition' () {
        const partId = Partitions.insert({
            title: 'Раздел'
        });
        Session.set('currentPartition', partId);
    },
    'click #remove-partition' () {
        Partitions.remove(this._id);

    }
});


/////////////////////////////////////
/////////////////////////////////////

Template.Layout.onCreated(function () {
    this.subscribe('partitions');
});

Template.Layout.helpers({
    partition () {
        return Partitions.findOne(Session.get('currentPartition'));
    }
});

/////////////////////////////////////
/////////////////////////////////////

Template.NavPartition.events({
    'click #set-partition' () {
        Session.set('currentPartition', this._id);
    }
});

Template.Partition.onCreated(function () {
    this.editTitle = new ReactiveVar(false);
    this.editChapterTitle = new ReactiveVar(false);
    this.autorun(() => {
        this.subscribe('partitionContent', Blaze.getData()._id);
    });
});

Template.Partition.helpers({
    editTitle () {
        return Template.instance().editTitle.get();
    },

    editChapterTitle () {
        return Template.instance().editChapterTitle.get();
    },

    sections () {
        return Sections.find({ partition: this._id });
    },

    section () {
        return Sections.findOne(Session.get('currentSection'));
    },

    chapter () {
        return Chapters.findOne(Session.get('currentChapter'));
    }
});

Template.Partition.events({
    'click #add-section' (evt, ti) {
        Sections.insert({
            partition: this._id,
            title: 'Секция'
        });
    },

    'click #partition-title' (evt, ti) {
        ti.editTitle.set(true);
        $(evt.target).focus();
    },

    'blur #partition-title' (evt, ti) {
        const title = ti.$(evt.target).htmltext();
        ti.editTitle.set(false);
        Partitions.update(this._id, { $set: { title: title } });        
    },

    'click #chapter-title' (evt, ti) {
        ti.editChapterTitle.set(true);
        ti.$(evt.target).focus();
    },
    'blur #chapter-title' (evt, ti) {
        const title = ti.$(evt.target).htmltext();
        const chapterId = Session.get('currentChapter');
        ti.editChapterTitle.set(false);
        Chapters.update(chapterId, { $set: { title: title } });        
    },

    'submit #add-block-form' (evt) {
        evt.preventDefault();

        const data = { _id: Random.id() };
        $(evt.target).serializeArray().forEach(elem => data[elem.name] = elem.value);
        Chapters.update(Session.get('currentChapter'), { $push: { blocks: data }});
    }
});

/////////////////////////////////////
/////////////////////////////////////

Template.Section.onCreated(function () {
    this.editTitle = new ReactiveVar(false);
});

Template.Section.helpers({
    editTitle () {
        return Template.instance().editTitle.get();
    },

    chapters () {
        return Chapters.find({ section: this._id });
    }

});

Template.Section.events({
    'click #remove-section' () {
        Chapters.find({ section: this._id }).forEach(chap => Chapters.remove(chap._id));
        Sections.remove(this._id);
    },
    'click #add-chapter' () {
        Chapters.insert({
            section: this._id,
            partition: Template.parentData()._id,
            title: 'Глава'
        });
    },

    'click #section-title' (evt, ti) {
        ti.editTitle.set(true);
    },
    'blur #section-title' (evt, ti) {
        const title = ti.$(evt.target).htmltext();
        Sections.update(this._id, { $set: { title: title } });

        ti.editTitle.set(false);
    }

});

/////////////////////////////////////
/////////////////////////////////////

Template.NavChapter.events({
    'click #set-chapter' () {
        Session.set('currentChapter', this._id);
        Session.set('currentSection', this.section);
    },
    'click #remove-chapter' () {
        Chapters.remove(this._id);
    }
});

Template.ChapterBlock.events({
    'click #remove-block' () {
        var chapterId = Session.get('currentChapter');
//        Meteor.call('removeChapterBlock', chapterId, this._id);
        Chapters.update({ _id: chapterId }, { $pull: { blocks: { _id: this._id } } });
    }
});