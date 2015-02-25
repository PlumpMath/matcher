const React = require('react');

class Image extends React.Component {
    constructor(props: {
        title: string;
        src: string;
        id: string;
        uid: string;
        // handleCardSelected: function;
    }) {
        super(props);
    }

    render() {
        var imageStyle = {
            width: '250px',
            height: 'auto'
        };
        var containerStyle = {
            maxHeight: '250px',
            overflow: 'hidden',
            position: 'relative',
            transition: '0.5s all'
        };
        var pStyle = {
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'rgba(50,50,50,0.5)',
            padding: '5px',
            fontSize: '14px',
            color: 'rgb(255,255,255)'
        };
        var figureClass = this.props.isSelected ? '' : 'unselected';

        return(
            <figure
                className={figureClass}
                style={containerStyle}
                onClick={function() {
                    this.props.handleCardSelected(this.props.id, this.props.uid)
                }.bind(this)}
            >
                <p style={pStyle}>{this.props.title}</p>
                <img style={imageStyle} src={this.props.src} />
            </figure>
        );
    }
}

module.exports = Image;
