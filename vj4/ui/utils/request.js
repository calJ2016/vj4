import i18n from './i18n';

const request = {};

request.ajax = async function (options) {
  return new Promise((resolve, reject) => {
    $.ajax({
      dataType: 'json',
      ...options,
    })
    .fail((jqXHR, textStatus, errorThrown) => {
      if (textStatus === 'abort') {
        const err = new Error(i18n('Aborted'));
        err.aborted = true;
        reject(err);
      } else if (jqXHR.readyState === 0) {
        reject(new Error(i18n('Network error')));
      } else if (errorThrown instanceof Error) {
        reject(errorThrown);
      } else if (typeof jqXHR.responseJSON === 'object' && jqXHR.responseJSON.error) {
        reject(new Error(jqXHR.responseJSON.error.message));
      } else {
        reject(new Error(textStatus));
      }
    })
    .done(resolve);
  });
};

request.post = function (url, dataOrForm = {}, options = {}) {
  let postData;
  if (dataOrForm instanceof jQuery && dataOrForm.is('form')) {
    // $form
    postData = dataOrForm.serialize();
  } else if (dataOrForm instanceof Node && $(dataOrForm).is('form')) {
    // form
    postData = $(dataOrForm).serialize();
  } else if (typeof dataOrForm === 'string') {
    // foo=bar&box=boz
    postData = dataOrForm;
  } else {
    // {foo: 'bar'}
    postData = $.param({
      csrf_token: UiContext.csrf_token,
      ...dataOrForm,
    }, true);
  }
  return request.ajax({
    url,
    method: 'post',
    data: postData,
    ...options,
  });
};

request.get = function (url, qs = {}, options = {}) {
  return request.ajax({
    url,
    data: qs,
    method: 'get',
    ...options,
  });
};

export default request;
