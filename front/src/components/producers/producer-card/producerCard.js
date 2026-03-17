import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { ArrowRepeat, DashLg, Pencil, Plus, Trash } from 'react-bootstrap-icons'
import './producerCard.scss'
import useDefaultErrorHandler from '../../../utils/useDefaultErrorHandler'
import { BackConfContext } from '../../../context/backConfContext'
import { getOptConfirm, getOptOk, ModalContext } from '../../modals/genericModalContext'
import axios from 'axios'
import { Loader } from '../../other/loader/loader'
import GenericModal, { useGenericModal, useGenericModalOptions } from '../../modals/genericModal'
import DetachProducerModal, { useDetachProducerModal } from '../../modals/detachProducerModal'
import { useNotification } from '../../toasts/toastContext'

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
  const { isVisibleDetachModal, toggleDetachModal } = useDetachProducerModal()
  const { notifySuccess, notifyWarning } = useNotification()

  const getFormProducer = (producer, query) => back?.isLoaded && back.getConsole(producer, query)
  const portalConnected = back?.isLoaded && back.portalConnected;

  const [isEdit, setIsEdit] = useState(!!editMode)
  useEffect(() => setIsEdit(!!editMode), [editMode])
  const [showAttachButton, setShowAttachButton] = useState(!!attachUrl)
  const [attachLoading, setAttachLoading] = useState(false )

  const producerId = producer[propId]
  const producerName = producer[propName]

  const updatePortalOrganizationUrl = (suffix) => back?.isLoaded && back.getBackCatalog('portal/organizations', suffix)
  const detachOrganizationUrl = (id) => back?.isLoaded && back.getBackCatalog('/portal/detach/organizations', id)
  const hasTaskUrl = (id) => back?.isLoaded && back.getBackCatalog('/portal/has_task/organizations', id)

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

        // An error occurred, hide the attach button
        // The page must be reloaded to display the current status of the organization
        setShowAttachButton(false)
        setAttachLoading(false)
      })
  }

  const detachProducer = (id) => {
    axios
      .post(detachOrganizationUrl(id))
      .then(() => {
        notifySuccess('Votre demande a bien été soumise à l\'équipe administrative du portail.')
        refresh()
      })
      .catch((err) => {
        // On error, display a generic error message unless it's a 409 meaning a request is already pending
        if (err?.response?.status === 409) {
          notifyWarning('Une demande est déjà en cours pour cette organisation.')
        } else {
          defaultErrorHandler(
        'Une erreur est survenue. Veuillez consulter le rapport au sein de votre espace "Rapport portail" disponible depuis votre onglet "Admin".')
        }
      })
  }

  const checkHasTaskThenDetach = (id) => {
    axios
      .post(hasTaskUrl(id))
      .then((res) => {
        if (res.data) {
          notifyWarning('Une demande est déjà en cours pour cette organisation.')
        } else {
          toggleDetachModal()
        }
      })
      .catch(() => toggleDetachModal())
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
      <DetachProducerModal
        visible={isVisibleDetachModal}
        toggle={toggleDetachModal}
        onConfirm={() => detachProducer(producerId)}
      />
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
                  className={'btn btn-detach'}
                  onClick={() => checkHasTaskThenDetach(producerId)}
                  disabled={!portalConnected}
                >
                  <DashLg />
                </button>
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
            {portalConnected && showAttachButton && !producer['linked_producer_status'] && displayAttachButton()}
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
