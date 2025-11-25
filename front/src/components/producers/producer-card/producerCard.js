import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { ArrowRepeat, Pencil, Plus, Trash } from 'react-bootstrap-icons'
import useDefaultErrorHandler from '../../../utils/useDefaultErrorHandler'
import { BackConfContext } from '../../../context/backConfContext'
import { getOptConfirm, getOptOk, ModalContext } from '../../modals/genericModalContext'
import axios from 'axios'
import { Loader } from '../../other/loader/loader'
import GenericModal, { useGenericModal, useGenericModalOptions } from '../../modals/genericModal'

ProducerCard.prototype = {
  editMode: PropTypes.bool,
  hideEdit: PropTypes.bool,
  producer: PropTypes.object,
  propId: PropTypes.string,
  propName: PropTypes.string,
  displayFields: PropTypes.object,
  deleteUrl: PropTypes.func,
  deleteConfirmMsg: PropTypes.func,
  deleteMsg: PropTypes.func,
  refresh: PropTypes.func,
  attachUrl: PropTypes.func,
}

export function ProducerCard({
  editMode,
  hideEdit,
  producer,
  propId,
  propName,
  displayFields,
  deleteUrl,
  deleteConfirmMsg,
  deleteMsg,
  refresh,
  attachUrl,
}) {
  const { defaultErrorHandler } = useDefaultErrorHandler()
  const { backConf } = useContext(BackConfContext)
  const [back, setBack] = useState(backConf)
  useEffect(() => setBack(backConf), [backConf])
  const { options, changeOptions } = useGenericModalOptions()
  const { toggle, visible } = useGenericModal()

  const getFormProducer = (producer, query) => back?.isLoaded && back.getConsole(producer, query)

  const [isEdit, setIsEdit] = useState(!!editMode)
  useEffect(() => setIsEdit(!!editMode), [editMode])
  const [showAttachButton, setShowAttachButton] = useState(!!attachUrl)
  const [attachLoading, setAttachLoading] = useState(false )

  const producerId = producer[propId]
  const producerName = producer[propName]

  const updatePortalOrganizationUrl = (suffix) => back?.isLoaded && back.getBackCatalog('portal/organizations', suffix)

  const updateOrganizationFromPortal = (id) => {
    axios
      .get(updatePortalOrganizationUrl(id))
      .then(() => refresh())
      .catch((err) => defaultErrorHandler(err))
  }

  /**
   * Call for organization deletion
   * @param {*} id Identifier of the object to delete
   */
  const deleteProducer = (id) => {
    axios
      .delete(deleteUrl(id))
      .then(() => {
        changeOptions(getOptOk(deleteMsg(id), () => refresh()))
        toggle()
      })
      .catch((err) => defaultErrorHandler(err))
  }

  const attachProducer = (id) => {
    setAttachLoading(true)
    setShowAttachButton(false)
    axios
      .post(attachUrl(id))
      .then(() => {
        setAttachLoading(false)
      })
      .catch((err) => {
        defaultErrorHandler(err)

        // Une erreur est survenue, on n'affiche plus le bouton de rattachement
        // On doit recharger la page pour afficher le statut actuel de l'organisation
        setShowAttachButton(false)
        setAttachLoading(false)
      })
  }

  /**
   * call for confirmation before organization deletion
   * @param {*} id Identifier of the organization to delete
   */
  const triggerDeleteProducer = (id) => {
    changeOptions(getOptConfirm(deleteConfirmMsg(producerName), () => deleteProducer(id)))
    toggle()
  }

  const displayEditionButton = (hideEdit) =>
    hideEdit ? (
      <button type={'button'} className={'btn primary-btn'} disabled={hideEdit}>
        <Pencil />
      </button>
    ) : (
      <a
        href={getFormProducer('organizations', `update=${producerId}`)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn primary-btn"
      >
        <Pencil />
      </a>
    )

  const displayValidationStatus = (organizationStatus) => {
    switch (organizationStatus) {
      case 'DRAFT':
        return displaySpan('rudi', 'Publication en attente de validation')
      case 'IN_PROGRESS':
        return displaySpan('rudi', 'Publication en attente de validation')
      case 'CANCELLED':
        return displaySpan('danger', 'Publication refusée')
      case 'VALIDATED':
        return displaySpan('rudi', 'Publié')
      case 'DISENGAGED':
        return displaySpan('muted', 'Archivé')
      default:
        return ''
    }
  }
  const displayAttachmentStatus = (attachmentStatus) => {
    switch (attachmentStatus) {
      case 'DRAFT':
        return displaySpan('rudi', 'Rattachement en attente de validation')
      case 'IN_PROGRESS':
        return displaySpan('rudi', 'Rattachement en attente de validation')
      case 'CANCELLED':
        return displaySpan('danger', 'Rattachement refusé')
      case 'VALIDATED':
        return displaySpan('rudi', 'Rattaché')
      case 'DISENGAGED':
        return displaySpan('muted', 'Détaché')
      default:
        return ''
    }
  }

  const displaySpan = (level, text) => (
    <span className={'status-pill text-bg-' + level} id="status-pill">
      {text}
    </span>
  )

  const displayAttachButton = () => {
    return (
      <button type={'button'} className={'btn primary-btn'} onClick={() => attachProducer(producerId)}>
        Demander le rattachement <Plus />
      </button>
    )
  }

  return (
    <div className="col-12" key={producerId}>
      <GenericModal visible={visible} toggle={toggle} options={options} animation={false}></GenericModal>
      <div className="card card-margin">
        <h5 className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <a>{producerName}</a>
            <span className={'align-pill-right '}>
              {producer['organization_status'] && displayValidationStatus(producer['organization_status'])}
              {producer['linked_producer_status'] && displayAttachmentStatus(producer['linked_producer_status'])}
            </span>
            {isEdit && (
              <div className="btn-group" role="group">
                <button
                  type={'button'}
                  className={'btn primary-btn'}
                  onClick={() => updateOrganizationFromPortal(producerId)}
                >
                  <ArrowRepeat />
                </button>
                {displayEditionButton(hideEdit)}
                <button
                  type={'button'}
                  className="btn btn-danger"
                  onClick={() => triggerDeleteProducer(producerId)}
                  disabled={hideEdit}
                >
                  <Trash />
                </button>
              </div>
            )}
            {showAttachButton && !producer['linked_producer_status'] && displayAttachButton()}
            {attachLoading && (
              <div className="outer-loader-container" role="status">
                <Loader size={'sm'} fullScreen={false}></Loader>
              </div>

            )}
          </div>
        </h5>
        <div className="card-body">
          {Object.keys(displayFields).map(
            (key) =>
              producer[key] && (
                <p className="card-text" key={`${producerId}.${key}`}>
                  {displayFields[key]}&nbsp;:&nbsp;
                  <small className="text-muted">
                    {!Array.isArray(producer[key]) ? producer[key] : JSON.stringify(producer[key])}
                  </small>
                </p>
              )
          )}
        </div>
      </div>
    </div>
  )
}
