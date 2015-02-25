var _ = require('underscore');
var React = require('react');
var Image = require('./components/image.jsx');
var CLIENT_ID = 'b45d8d58680bb94';

class Matcher extends React.Component {
    constructor(props: { imageCount: number }) {
        super(props);

        this.state = { images: [], selected: [] };
        this.fetchRandomImages(this.props.imageCount);
    }

    /**
     * Fetch random images from Imgur using their API.
     * @param imageCount {Number} This is the number of
     * _unique_ images to use in the game. Note that the
     * _actual_ number of images will be doubled since
     * each image needs a second to complete the matching
     * pair.
     */
    fetchRandomImages(imageCount) {
        var req = new XMLHttpRequest();

        function success() {
            var clone = [];
            /**
             * Parse the response and constrain the number of images used.
             * The default response will return > 50 images so it's safe to
             * assume that the intended number of unique images
             * will be a subset of this initial JSON batch.
             */
            var images = JSON.parse(req.response)
                .data
                .slice(0, this.props.imageCount);

            /**
             * This was a really interesting problem.
             * The original intent was to create a duplicate set of images
             * from the original set. The problem is, they all need unique identifiers
             * and if you just make a flattened array of two images arrays, the second
             * half will contain references to the first half - which makes modifying
             * just one half impossible (like giving them a uid). The solution is to
             * use Object.create() to dissassociate the first half from second and
             * just use the prototypes from the first half to construct the second.
             */
            for (var i = 0; i < images.length; i++) {
                clone.push(Object.create(images[i]));
            }

            // create a shuffled array of images * 2 extended with a uid for each image
            images = _.chain(images)
                .zip(clone)
                .flatten()
                .shuffle()
                .map(function(img) {
                    return _.extend(img, { uid: _.uniqueId('img') });
                })
                .value();

            this.setState({
                images: images
            });
        }

        function error(e) {
            console.log('error', console.log(req.responseText));
        }

        req.addEventListener('load', success.bind(this), false);
        req.addEventListener('error', error, false);
        req.open('get', 'https://api.imgur.com/3/gallery/random/random/0', true);
        req.setRequestHeader('Authorization', `Client-ID ${CLIENT_ID}`);
        req.send();
    }

    /**
     * At this point, two image 'cards' have been
     * selected and they will now be compared. This
     * function will either remove the pair if they match
     * or unselect all images if they do not match.
     */
    compareCards() {
        var selected = this.state.selected;
        if (selected[0].id === selected[1].id) {
            // you guessed correctly
            this.setState({
                selected: [],
                images: _.reject(this.state.images, function(image) {
                    return _.findWhere(selected, { id: image.id });
                })
            })
        } else {
            // you didn't guess correctly
            this.reset();
        }
    }

    /**
     * This method will add cards to 'selected'
     * in the state, send them to be compared, or
     * unselect all cards depending on the number
     * already selected.
     * @param id {String} id of the image (not unique within pair)
     * @param uid {String} uid of the image (unique within pair)
     */
    handleCardSelected(id, uid) {
        var selected = this.state.selected;

        selected.push({
            id: id,
            uid: uid
        });

        // User clicked the same card twice
        if (selected[0].uid === uid && selected.length >= 2) return this.reset();

        // User has selected two cards
        if (selected.length >= 2) {
            /**
             * Allow a delay before comparison so cards
             * don't disappear immediately.
             */
            setTimeout(this.compareCards.bind(this), 700);
        }

        this.setState({
            selected: selected
        });
    }

    // unselects all cards
    reset() {
        this.setState({
            selected: []
        });
    }

    render() {
        var images;
        var ulStyle = {
            listStyleType: 'none',
            textAlign: 'center'
        };
        var liStyle = {
            display: 'inline-block',
            margin: '10px'
        };

        if (!this.state.images.length) {
            return <div>we do not have images!</div>;
        }

        images = this.state.images.map(function(image) {
            var isSelected = !!_.findWhere(this.state.selected, { uid: image.uid });

            return(
                <li key={image.uid} style={liStyle}>
                    <Image
                        src={image.link}
                        title={image.title}
                        id={image.id}
                        uid={image.uid}
                        isSelected={isSelected}
                        handleCardSelected={this.handleCardSelected.bind(this)}
                    />
                </li>
            );
        }.bind(this));

        return(
            <ul style={ulStyle}>
                {images}
            </ul>
        );
    }
}

Matcher.defaultProps = { imageCount: 6 };

React.render(<Matcher />, document.querySelector('#app'));
