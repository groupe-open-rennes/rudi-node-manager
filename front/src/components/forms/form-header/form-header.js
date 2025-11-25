import "./form-header.scss"
import PropTypes from "prop-types";

FormeHeader.propTypes = {
    title: PropTypes.string.isRequired,
}

export function FormeHeader({
    title,
}) {

    return (
        <div className="form-header">
            <div className="form-header-container">
                <h1>{title}</h1>
            </div>
            <hr/>
        </div>
    )
}